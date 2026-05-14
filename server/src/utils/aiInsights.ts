import Anthropic from '@anthropic-ai/sdk';
import { logger } from './logger';

const client = new Anthropic();

export const generateTrafficInsights = async (
  transactionData: any[],
  boothData: any[]
): Promise<string> => {
  try {
    const summary = {
      totalTransactions: transactionData.length,
      totalRevenue: transactionData.reduce((sum, t) => sum + t.fee, 0),
      vehicleBreakdown: transactionData.reduce(
        (acc, t) => {
          acc[t.vehicleType] = (acc[t.vehicleType] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>
      ),
      topBooth: boothData[0]?.name,
    };

    const message = await client.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: `You are a traffic and revenue analyst. Based on this toll road data, provide 2-3 actionable insights in 2-3 sentences:

Data Summary:
- Total Transactions: ${summary.totalTransactions}
- Total Revenue: $${summary.totalRevenue.toFixed(2)}
- Vehicle Types: ${JSON.stringify(summary.vehicleBreakdown)}
- Top Booth: ${summary.topBooth}

Provide insights about traffic patterns, revenue trends, or peak hours.`,
        },
      ],
    });

    const responseText =
      message.content[0].type === 'text' ? message.content[0].text : '';
    return responseText;
  } catch (error) {
    logger.error('AI Insights generation error:', error);
    return 'Unable to generate insights at this time';
  }
};

export const generateRevenueAnalysis = async (revenueData: any[]): Promise<string> => {
  try {
    const totalRevenue = revenueData.reduce((sum, d) => sum + d.totalFee, 0);
    const avgDaily = revenueData.length > 0 ? totalRevenue / revenueData.length : 0;

    const message = await client.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: `As a revenue analyst, provide 2-3 insights about this toll road revenue data in 2-3 sentences:

Revenue Data:
- Total Revenue: $${totalRevenue.toFixed(2)}
- Average Daily: $${avgDaily.toFixed(2)}
- Days Tracked: ${revenueData.length}

Analyze trends and provide recommendations.`,
        },
      ],
    });

    const responseText =
      message.content[0].type === 'text' ? message.content[0].text : '';
    return responseText;
  } catch (error) {
    logger.error('Revenue analysis error:', error);
    return 'Unable to generate analysis at this time';
  }
};
