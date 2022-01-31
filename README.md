# ECS Service Auto Scaling Article Code

This is the code sample to accompany the article at http://distilledcourses.com/blog/ecs-service-auto-scaling-with-the-cdk

Branches:

* `master`                  builds basic service CDK stack
* `scale-by-cpu`            extends stack with a target tracking scaling policy (CPU utilization)
* `scale-by-request-count`  extends stack with a target tracking scaling policy (Target Request Count)
* `scheduled-scaling`       extends stack with a scheduled scaling example
## Useful CDK commands

 * `npm run build`   compile typescript to js
 * `npm run watch`   watch for changes and compile
 * `npm run test`    perform the jest unit tests
 * `cdk deploy`      deploy this stack to your default AWS account/region
 * `cdk diff`        compare deployed stack with current state
 * `cdk synth`       emits the synthesized CloudFormation template
