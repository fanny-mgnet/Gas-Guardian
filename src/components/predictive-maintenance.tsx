'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { getPrediction } from '@/lib/actions';
import { Wand2, AlertTriangle, Loader2 } from 'lucide-react';
import type { PredictFutureAlertsOutput } from '@/ai/flows/predictive-maintenance-alerts';

interface PredictiveMaintenanceProps {
  deviceId: string;
}

export function PredictiveMaintenance({ deviceId }: PredictiveMaintenanceProps) {
  const [prediction, setPrediction] = useState<PredictFutureAlertsOutput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handlePredict = async () => {
    setIsLoading(true);
    setError(null);
    setPrediction(null);

    const result = await getPrediction(deviceId);
    if (result.error) {
      setError(result.error);
    } else if (result.data) {
      setPrediction(result.data);
    }
    setIsLoading(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wand2 className="h-5 w-5 text-primary" />
          <span>Predictive Maintenance</span>
        </CardTitle>
        <CardDescription>
          Use AI to analyze alert history and predict potential future issues based on trends.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={handlePredict} disabled={isLoading} className="w-full">
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Analyzing...
            </>
          ) : (
            'Predict Next Alert'
          )}
        </Button>
        
        {error && (
            <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Prediction Failed</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
            </Alert>
        )}

        {prediction && (
            <div className="space-y-4 pt-4">
                <h3 className="font-semibold">AI Prediction Result:</h3>
                <div>
                    <p className="text-sm font-medium mb-1">Prediction</p>
                    <p className="text-lg font-bold text-primary">{prediction.prediction}</p>
                </div>
                <div>
                    <p className="text-sm font-medium mb-2">Confidence</p>
                    <div className="flex items-center gap-2">
                        <Progress value={prediction.confidence * 100} className="w-[80%]" />
                        <span className="text-sm font-semibold">{(prediction.confidence * 100).toFixed(0)}%</span>
                    </div>
                </div>
                 <div>
                    <p className="text-sm font-medium mb-1">AI Reasoning</p>
                    <p className="text-sm text-muted-foreground p-3 bg-muted rounded-md">{prediction.reasoning}</p>
                </div>
            </div>
        )}
      </CardContent>
    </Card>
  );
}
