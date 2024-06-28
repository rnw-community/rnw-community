# @HistogramMetric decorator

Class property decorator that runs [Prometheus](https://prometheus.io) [histogram metric](https://prometheus.io/docs/concepts/metric_types/#histogram) on your method.

## Installation

For using this decorator you need to install following packages:
- [`prom-client` package](https://github.com/siimon/prom-client)
- [`willsoto/nestjs-prometheus` package](https://github.com/willsoto/nestjs-prometheus)

## Usage

Please follow official documentation for [histogram metrics configuration](https://github.com/siimon/prom-client?tab=readme-ov-file#histogram) options.

```typescript
import {HistogramMetric} from '@rnw-community/nestjs-enterprise';

class CatsService {
    @HistogramMetric('cats_find_all', {buckets: [0.1, 5, 15, 50, 100, 500]})
    findAll() {
        return 'This action returns all cats';
    }
}
```

