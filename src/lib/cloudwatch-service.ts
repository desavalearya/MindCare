// AWS CloudWatch Service for MindCare
import { 
  CloudWatchLogsClient, 
  PutLogEventsCommand,
  CreateLogGroupCommand,
  CreateLogStreamCommand,
  DescribeLogStreamsCommand
} from '@aws-sdk/client-cloudwatch-logs';
import {
  CloudWatchClient,
  PutMetricDataCommand,
  MetricDatum
} from '@aws-sdk/client-cloudwatch';
import { AWS_REGION } from './aws-config';

const logsClient = new CloudWatchLogsClient({ region: AWS_REGION });
const metricsClient = new CloudWatchClient({ region: AWS_REGION });

const LOG_GROUP_NAME = '/mindcare/application';
const NAMESPACE = 'MindCare';

export type LogLevel = 'INFO' | 'WARN' | 'ERROR' | 'DEBUG';

interface LogEntry {
  level: LogLevel;
  message: string;
  metadata?: Record<string, any>;
  timestamp?: Date;
}

/**
 * Initialize CloudWatch log group and stream
 */
export const initializeLogging = async (streamName: string) => {
  try {
    // Create log group if it doesn't exist
    try {
      await logsClient.send(new CreateLogGroupCommand({ logGroupName: LOG_GROUP_NAME }));
    } catch (error: any) {
      if (error.name !== 'ResourceAlreadyExistsException') {
        throw error;
      }
    }

    // Create log stream if it doesn't exist
    try {
      await logsClient.send(new CreateLogStreamCommand({
        logGroupName: LOG_GROUP_NAME,
        logStreamName: streamName,
      }));
    } catch (error: any) {
      if (error.name !== 'ResourceAlreadyExistsException') {
        throw error;
      }
    }
  } catch (error) {
    console.error('Error initializing CloudWatch logging:', error);
  }
};

/**
 * Send log to CloudWatch
 */
export const logToCloudWatch = async (
  streamName: string,
  entry: LogEntry
): Promise<void> => {
  try {
    const timestamp = entry.timestamp || new Date();
    const message = JSON.stringify({
      level: entry.level,
      message: entry.message,
      metadata: entry.metadata,
      timestamp: timestamp.toISOString(),
    });

    // Get sequence token
    const describeCommand = new DescribeLogStreamsCommand({
      logGroupName: LOG_GROUP_NAME,
      logStreamNamePrefix: streamName,
    });
    const describeResponse = await logsClient.send(describeCommand);
    const sequenceToken = describeResponse.logStreams?.[0]?.uploadSequenceToken;

    // Put log event
    const putCommand = new PutLogEventsCommand({
      logGroupName: LOG_GROUP_NAME,
      logStreamName: streamName,
      logEvents: [{
        message,
        timestamp: timestamp.getTime(),
      }],
      sequenceToken,
    });

    await logsClient.send(putCommand);
  } catch (error) {
    console.error('Error logging to CloudWatch:', error);
  }
};

/**
 * Log info message
 */
export const logInfo = async (streamName: string, message: string, metadata?: Record<string, any>) => {
  await logToCloudWatch(streamName, { level: 'INFO', message, metadata });
};

/**
 * Log warning message
 */
export const logWarning = async (streamName: string, message: string, metadata?: Record<string, any>) => {
  await logToCloudWatch(streamName, { level: 'WARN', message, metadata });
};

/**
 * Log error message
 */
export const logError = async (streamName: string, message: string, metadata?: Record<string, any>) => {
  await logToCloudWatch(streamName, { level: 'ERROR', message, metadata });
};

/**
 * Log debug message
 */
export const logDebug = async (streamName: string, message: string, metadata?: Record<string, any>) => {
  await logToCloudWatch(streamName, { level: 'DEBUG', message, metadata });
};

/**
 * Send custom metric to CloudWatch
 */
export const putMetric = async (
  metricName: string,
  value: number,
  unit: string = 'Count',
  dimensions?: Record<string, string>
): Promise<void> => {
  try {
    const metricData: MetricDatum = {
      MetricName: metricName,
      Value: value,
      Unit: unit,
      Timestamp: new Date(),
    };

    if (dimensions) {
      metricData.Dimensions = Object.entries(dimensions).map(([name, value]) => ({
        Name: name,
        Value: value,
      }));
    }

    const command = new PutMetricDataCommand({
      Namespace: NAMESPACE,
      MetricData: [metricData],
    });

    await metricsClient.send(command);
  } catch (error) {
    console.error('Error putting metric to CloudWatch:', error);
  }
};

/**
 * Track user activity metric
 */
export const trackUserActivity = async (userId: string, activityType: string) => {
  await putMetric('UserActivity', 1, 'Count', {
    UserId: userId,
    ActivityType: activityType,
  });
};

/**
 * Track API response time
 */
export const trackResponseTime = async (endpoint: string, duration: number) => {
  await putMetric('APIResponseTime', duration, 'Milliseconds', {
    Endpoint: endpoint,
  });
};

/**
 * Track error occurrence
 */
export const trackError = async (errorType: string, errorMessage: string) => {
  await putMetric('ErrorCount', 1, 'Count', {
    ErrorType: errorType,
    ErrorMessage: errorMessage.substring(0, 100), // Limit length
  });
};

/**
 * Track mood check-in
 */
export const trackMoodCheckIn = async (userId: string, mood: string) => {
  await putMetric('MoodCheckIn', 1, 'Count', {
    UserId: userId,
    Mood: mood,
  });
};

/**
 * Track AI chat usage
 */
export const trackAIChatUsage = async (userId: string, messageCount: number) => {
  await putMetric('AIChatMessages', messageCount, 'Count', {
    UserId: userId,
  });
};
