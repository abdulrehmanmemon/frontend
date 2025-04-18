import cubejsApi from './cubejsApi'; 


// Fetch Big Numbers for Revenue Dashboard
export const fetchBigNumbers = async () => {
  try {
    const queries = {
      totalRevenue: { measures: ['charge.total_revenue_charge'] },
      MoMRevenue: { measures: ['charge.MoM_charge'] }, 
      percentMoM: { measures: ['charge.percent_MoM_charge'] },
      totalActiveCustomers: { measures: ['account.total_active_customers_account'] },
      MoMActive: { measures: ['account.MoM_account'] }, 
      percentMoMActive: { measures: ['account.percent_MoM_account'] },
      revenuePerCharge: { measures: ['charge.revenue_per_charge'] },
      MoMrpc: { measures: ['charge.MoM_rpc_charge'] }, 
      percentMoMrpc: { measures: ['charge.percent_MoM_rpc_charge'] },
    };

    const results = await Promise.all(
      Object.entries(queries).map(async ([key, query]) => {
        const response = await cubejsApi.load(query);
        return { key, value: response.rawData()[0]?.[Object.keys(response.rawData()[0])[0]] || 0 };
      })
    );

    return results.reduce((acc, { key, value }) => {
      acc[key] = value;
      return acc;
    }, {});
  } catch (error) {
    console.error('Error fetching big numbers:', error);
    return null;
  }
};


// Fetch Bar Chart Data for Revenue Dashboard
export const fetchBarChartData = async (metric) => {
  try {
    const queryConfig = {
      revenueByProduct: {
        measures: ['charge.total_revenue_charge'],
        dimensions: ['product.product_name', 'charge.charge_date'],
        timeDimensions: [{ dimension: 'charge.charge_date', granularity: 'month' }],
      },
      revenueByChargeType: {
        measures: ['charge.total_revenue_charge'],
        dimensions: ['charge.charge_type', 'charge.charge_date'],
        timeDimensions: [{ dimension: 'charge.charge_date', granularity: 'month' }],
      },
      revenueByCustomerLifeCycle: {
        measures: ['charge.total_revenue_charge'],
        dimensions: ['account.customer_lifecycle', 'charge.charge_date'],
        timeDimensions: [{ dimension: 'charge.charge_date', granularity: 'month' }],
      },
    };

    const query = queryConfig[metric];
    const response = await cubejsApi.load(query);

    return response.rawData();
  } catch (error) {
    console.error('Error fetching bar chart data:', error);
    return [];
  }
};

export const fetchDealData = async () => {
  try {
    const queries = {
      // Deal Overview Metrics 
      dealCount: { measures: ['deal.count_deal'] },
      totalDealValue: { measures: ['deal.total_value_deal'] },
      avgDealValue: { measures: ['deal.avg_value_deal'] },
      maxDealValue: { measures: ['deal.max_value_deal'] },
      minDealValue: { measures: ['deal.min_value_deal'] },
      wonDeals: { measures: ['deal.won_deal'] },
      lostDeals: { measures: ['deal.lost_deal'] },
      winRate: { measures: ['deal.win_rate_deal'] },

      // Bar & Doughnut Charts
      dealsByStage: { 
        measures: ['deal.count_deal'], 
        dimensions: ['deal.stage'] 
      },
      dealsByIndustry: { 
        measures: ['deal.count_deal'], 
        dimensions: ['company.industry'] 
      },
      

      // Company Overview
      totalCompanyRevenue: { measures: ['company.total_revenue_company'] },
      avgCompanyRevenue: { measures: ['company.avg_revenue_company'] },
      totalNetIncome: { measures: ['company.total_net_income_company'] },
      highRiskCompanies: { measures: ['company.high_risk_companies_company'] },
    };

    const results = await Promise.all(
      Object.entries(queries).map(async ([key, query]) => {
        const response = await cubejsApi.load(query);
        return { key, value: response.rawData() || [] };
      })
    );

    return results.reduce((acc, { key, value }) => {
      acc[key] = value;
      return acc;
    }, {});
  } catch (error) {
    console.error('Error fetching deal data:', error);
    return null;
  }
};
