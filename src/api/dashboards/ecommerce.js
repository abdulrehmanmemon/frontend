import { dummyEcommerceDashboardData } from "@/database/dashboards/ecommerce";

export const getEcommerceDashboardData = async () => {
  return {
    status: "success",
    data: {
      counters: dummyEcommerceDashboardData.getCounters(),
      orders: dummyEcommerceDashboardData.getOrders(),
      recentMessages: dummyEcommerceDashboardData.getRecentMessages(),
      overviewStats: dummyEcommerceDashboardData.getOverviewStats(),
      topCountries: dummyEcommerceDashboardData.getTopCountries(),
      customerInteractions: dummyEcommerceDashboardData.getInteractions(),
    },
    code: 200,
  };
};
