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

    if (metricServiceOrigin) {
      fetch('http://localhost:8080/api/metric', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: this.name, value: duration, origin: metricServiceOrigin }),
      }).catch((err) => {
        console.error(err);
      });
    }

    return duration;
  }
}
