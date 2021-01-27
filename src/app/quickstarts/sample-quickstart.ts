import { QuickStart } from '@cloudmosaic/quickstarts';

export const sampleQuickStart: QuickStart = {
  apiVersion: 'mk-ui-frontend/v1',
  kind: 'QuickStarts',
  metadata: {
    name: 'sample',
  },
  spec: {
    version: 0.1,
    displayName: 'Sample display name',
    durationMinutes: 10,
    icon: '',
    description: `Sample description`,
    prerequisites: [`Sample prerequisites`],
    introduction: `### This is just a sample from OpenShift
#### This sample will be updated soon for MK.
You should have previously created the **sample-app** application and **nodejs-sample** deployment via the **Get started with a sample** quick start. If you haven't, you may be able to follow these tasks with any existing deployment.`,
    tasks: [
      {
        title: `Viewing the monitoring details of your sample application`,
        description: `### To view the details of your sample application:
1. Go to the project your sample application was created in.
2. In the **</> Developer** perspective, go to **Topology** view.
3. Click on the **nodejs-sample** deployment to view its details.
4. Click on the **Monitoring** tab in the side panel.
You can see context sensitive metrics and alerts in the **Monitoring** tab.`,
        review: {
          instructions: `#### To verify you can view the monitoring information:
1. Do you see a **Metrics** accordion in the side panel?
2. Do you see a **View monitoring dashboard** link in the **Metrics** accordion?
3. Do you see three charts in the **Metrics** accordion: **CPU Usage**, **Memory Usage** and **Receive Bandwidth**?`,
          failedTaskHelp: `This task isn’t verified yet. Try the task again.`,
        },
        summary: {
          success: `You have learned how you can monitor your sample app!`,
          failed: `Try the steps again.`,
        },
      },
      {
        title: `Viewing your project monitoring dashboard`,
        description: `### To view the project monitoring dashboard in the context of **nodejs-sample**:
1. Click on the **View monitoring dashboard** link in the side panel.
2. You can change the **Time Range** and **Refresh Interval** of the dashboard.
3. You can change the context of the dashboard as well by clicking on the drop-down list. Select a specific workload or **All Workloads** to view the dashboard in the context of the entire project.`,
        review: {
          instructions: `#### To verify that you are able to view the monitoring dashboard:
Do you see metrics charts in the dashboard?`,
          failedTaskHelp: `This task isn’t verified yet. Try the task again.`,
        },
        summary: {
          success: `You have learned how to view the dashboard in the context of your sample app!`,
          failed: `Try the steps again.`,
        },
      },
      {
        title: `Viewing custom metrics`,
        description: `### To view custom metrics:
1. Click on the **Metrics** tab of the **Monitoring** page.
2. Click the **Select Query** drop-down list to see the available queries.
3. Click on **Filesystem Usage** from the list to run the query.`,
        review: {
          instructions: `#### Verify you can see the chart associated with the query:
Do you see a chart displayed with filesystem usage for your project?  Note: select **Custom Query** from the dropdown to create and run a custom query utilizing PromQL.
`,
          failedTaskHelp: `This task isn’t verified yet. Try the task again.`,
        },
        summary: {
          success: `You have learned how to run a query!`,
          failed: `Try the steps again.`,
        },
      },
    ],
    conclusion: `You have learned how to access workload monitoring and metrics!`,

    nextQuickStart: [``],
  },
};
