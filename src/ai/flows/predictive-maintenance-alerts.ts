'use server';
/**
 * @fileOverview A predictive maintenance AI agent that analyzes past alerts to predict future alerts.
 *
 * - predictFutureAlerts - A function that handles the prediction of future alerts.
 * - PredictFutureAlertsInput - The input type for the predictFutureAlerts function.
 * - PredictFutureAlertsOutput - The return type for the predictFutureAlerts function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PredictFutureAlertsInputSchema = z.object({
  alertHistory: z
    .string()
    .describe(
      'A JSON string containing the alert history for a specific device. Each entry should have a timestamp and gas level.'
    ),
  deviceDetails: z.string().describe('A JSON string containing details about the device, such as location and model.'),
});
export type PredictFutureAlertsInput = z.infer<typeof PredictFutureAlertsInputSchema>;

const PredictFutureAlertsOutputSchema = z.object({
  prediction: z.string().describe('A prediction of when the next alert might occur, based on the alert history.'),
  confidence: z
    .number()
    .describe('A confidence score (0-1) for the prediction, indicating how reliable the prediction is.'),
  reasoning: z.string().describe('The reasoning behind the prediction, explaining the patterns observed in the alert history.'),
});
export type PredictFutureAlertsOutput = z.infer<typeof PredictFutureAlertsOutputSchema>;

export async function predictFutureAlerts(input: PredictFutureAlertsInput): Promise<PredictFutureAlertsOutput> {
  return predictFutureAlertsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'predictFutureAlertsPrompt',
  input: {schema: PredictFutureAlertsInputSchema},
  output: {schema: PredictFutureAlertsOutputSchema},
  prompt: `You are an expert predictive maintenance AI, specializing in predicting future gas level alerts based on historical data.

You will analyze the alert history and device details to predict when the next alert might occur.
Consider trends, patterns, and any relevant information about the device.

Output a prediction, a confidence score (0-1), and the reasoning behind your prediction.

Alert History:
{{alertHistory}}

Device Details:
{{deviceDetails}}`,
});

const predictFutureAlertsFlow = ai.defineFlow(
  {
    name: 'predictFutureAlertsFlow',
    inputSchema: PredictFutureAlertsInputSchema,
    outputSchema: PredictFutureAlertsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
