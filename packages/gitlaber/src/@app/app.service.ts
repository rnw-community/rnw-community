import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
    private readonly info = {
        name: 'GitLaber',
        status: 'running',
        version: '1.0.0',
    };

    getInfo(): typeof this.info {
        return this.info;
    }
}
