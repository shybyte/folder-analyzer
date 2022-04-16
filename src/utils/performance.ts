const metricServiceOrigin = localStorage.getItem('metricService.origin');

export class PerformanceMetricDataPoint {
  public static start(name: string) {
    console.time(name);
    return new PerformanceMetricDataPoint(name);
  }

  private constructor(private readonly name: string, private readonly startTime = performance.now()) {}

  end(): number {
    console.timeEnd(this.name);
    const duration = performance.now() - this.startTime;
    sendMetricIfConfigured(this.name, duration);
    return duration;
  }
}

let currentMetric: PerformanceMetricDataPoint;

export function recordMetric(newMetric?: string) {
  if (currentMetric) {
    currentMetric.end();
  }
  if (newMetric) {
    currentMetric = PerformanceMetricDataPoint.start(newMetric);
  }
}

export function sendMetricIfConfigured(name: string, value: number) {
  if (metricServiceOrigin) {
    fetch('http://localhost:8080/api/metric', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name: name, value: value, origin: metricServiceOrigin }),
    }).catch((err) => {
      console.error(err);
    });
  }
}
