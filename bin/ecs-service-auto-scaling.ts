import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { EcsServiceAutoScalingStack } from '../lib/ecs-service-auto-scaling-stack';

const app = new cdk.App();
new EcsServiceAutoScalingStack(app, 'EcsServiceAutoScalingStack');
