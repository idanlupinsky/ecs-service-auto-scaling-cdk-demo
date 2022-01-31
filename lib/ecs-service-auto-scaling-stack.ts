import * as cdk from '@aws-cdk/core';
import * as cloudwatch from '@aws-cdk/aws-cloudwatch';
import * as ec2 from '@aws-cdk/aws-ec2';
import * as ecs from '@aws-cdk/aws-ecs';
import * as ecsPatterns from '@aws-cdk/aws-ecs-patterns';
import { Duration } from '@aws-cdk/core';
import { Statistic } from '@aws-cdk/aws-cloudwatch';

export class EcsServiceAutoScalingStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const cluster = this.createCluster();
    const albService = this.createAlbService(cluster);
    this.createDashboard(albService);
  }

  createCluster(): ecs.Cluster {
    const vpc = new ec2.Vpc(this, 'EcsAutoScalingVpc', {
      maxAzs: 2,
      natGateways: 0
    });

    vpc.addGatewayEndpoint('S3GatewayVpcEndpoint', {
      service: ec2.GatewayVpcEndpointAwsService.S3
    });
    vpc.addInterfaceEndpoint('EcrDockerVpcEndpoint', {
      service: ec2.InterfaceVpcEndpointAwsService.ECR_DOCKER
    });
    vpc.addInterfaceEndpoint('EcrVpcEndpoint', {
      service: ec2.InterfaceVpcEndpointAwsService.ECR
    });
    vpc.addInterfaceEndpoint('CloudWatchLogsVpcEndpoint', {
      service: ec2.InterfaceVpcEndpointAwsService.CLOUDWATCH_LOGS
    });

    const cluster = new ecs.Cluster(this, 'EcsClusterAutoScalingDemo', {
      vpc: vpc
    });

    return cluster;
  }

  private createAlbService(cluster: ecs.Cluster): ecsPatterns.ApplicationLoadBalancedFargateService {
    const taskDefinition = new ecs.FargateTaskDefinition(this, 'AutoScalingServiceTask', {
      family: 'AutoScalingServiceTask'
    });

    const image = ecs.ContainerImage.fromAsset('service');

    const containerDefinition = taskDefinition.addContainer('app', {
      image: image,
      portMappings: [{ containerPort: 8080 }]
    });

    const albService = new ecsPatterns.ApplicationLoadBalancedFargateService(
      this, 'AutoScalingService', {
      cluster: cluster,
      desiredCount: 1,
      taskDefinition: taskDefinition
    });
    return albService;
  }

  private createDashboard(albService: ecsPatterns.ApplicationLoadBalancedFargateService) {
    const dashboard = new cloudwatch.Dashboard(this, 'Dashboard', {
      dashboardName: 'AutoScalingExample'
    });

    const cpuUtilizationMetric = albService.service.metricCpuUtilization({
      period: Duration.minutes(1),
      label: 'CPU Utilization'
    });
    const albRequestCountMetric = albService.loadBalancer.metricRequestCount({
      period: Duration.minutes(1),
      label: 'LB Request Count'
    });
    const targetGroupRequestCountMetric = albService.targetGroup.metricRequestCount({
      period: Duration.minutes(1),
      label: 'Target Group Request Count'
    });
    const requestCountPerTargetMetric = albService.targetGroup.metricRequestCountPerTarget({
      period: Duration.minutes(1),
      statistic: Statistic.SUM,
      label: 'Target Request Count'
    });
    const healthyHostCountMetric = albService.targetGroup.metricHealthyHostCount({
      period: Duration.minutes(1),
      label: 'Healthy Tasks'
    });

    dashboard.addWidgets(
      new cloudwatch.SingleValueWidget({
        title: 'Current Values',
        metrics: [cpuUtilizationMetric, healthyHostCountMetric, albRequestCountMetric, targetGroupRequestCountMetric, requestCountPerTargetMetric],
        width: 24
      }),
      new cloudwatch.GraphWidget({
        left: [cpuUtilizationMetric],
        width: 12,
        title: 'CPU Utilization'
      }),
      new cloudwatch.GraphWidget({
        left: [healthyHostCountMetric],
        width: 12,
        title: 'Healthy Tasks'
      }),
      new cloudwatch.GraphWidget({
        left: [albRequestCountMetric],
        width: 8,
        title: 'LB Request Count'
      }),
      new cloudwatch.GraphWidget({
        left: [targetGroupRequestCountMetric],
        width: 8,
        title: 'Target Group Request Count'
      }),
      new cloudwatch.GraphWidget({
        left: [requestCountPerTargetMetric],
        width: 8,
        title: 'Target Request Count'
      })
    );
  }
}
