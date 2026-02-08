import ScheduleModel from "../../models/ScheduleModel";
import UoftAlertSchedule from "./UoftAlertSchedule";
import LambdaAdapter from "@/utils/services/LambdaAdapter";
import Logger from "@/utils/Logger";

import alertsData from "../../data/alerts-data";
import UoftUpdateSchedule from "./UoftUpdateSchedule";

const { maxLambdas } = alertsData;

/**
 * TODO:
 * - ** Automatic updating of course and section data before enrollment periods start
 * - ** Email spam prevention + logging if reaches threshold
 * - * Add issues entry for users
 * - * Add quick link to pause alert in email template
 * - * Add caching to further reduce database requests by storing active alerts? is this possible if a new active alert is created?
 *
 * DONE:
 * - ** Fix Lambda functions integration
 */

export const initialize = async () => {
  if (process.env.NODE_ENV !== "development") {
    await initializeFunctions();
  }

  // await UoftUpdateSchedule.initialize();

  // await UoftAlertSchedule.initialize();
};

async function initializeFunctions() {
  const lambdas = await LambdaAdapter.listFunctions();

  if (lambdas.length < maxLambdas) {
    Logger.info(`Creating ${maxLambdas - lambdas.length} additional Lambda functions for requests`);

    await Promise.allSettled(
      Array.from({ length: maxLambdas - lambdas.length }).map(async (_, i) => {
        const lambdaName = `request-${lambdas.length + i + 1}`;
        await LambdaAdapter.create(lambdaName, "request");
        lambdas.push(lambdaName);
      }),
    );
  }
}
