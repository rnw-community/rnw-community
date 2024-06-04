# @HistogramMetric decorator

Class property decorator that logs the method name and its arguments when the method is called.

## Usage

> Please follow official documentation
> for [histogram metrics configuration](https://github.com/siimon/prom-client?tab=readme-ov-file#histogram) options.

```typescript
import {HistogramMetric} from '@rnw-community/nestjs-enterprise';

class CatsService {
    @HistogramMetric('cats_find_all', {buckets: [0.1, 5, 15, 50, 100, 500]})
    findAll() {
        return 'This action returns all cats';
    }
}
```

