import { useMemo, useState } from "react";

import { arrayHelper } from "@/helpers";
import { createHookedContext } from "@/hooks/create-hooked-context";

const useHook = ({ data }) => {
  const {
    orders,
    counters,
    recentMessages,
    topCountries,
    customerInteractions,
    overviewStats,
  } = data;
  const [overviewDuration, setOverviewDuration] = useState("year");
  const [orderTableSelected, setOrderTableSelected] = useState([]);

  const onOrderTableSelection = (id) => {
    setOrderTableSelected([...arrayHelper.toggleItem(orderTableSelected, id)]);
  };

  const onOrderTableAllSelection = () => {
    if (orderTableSelectionState == "all") {
      setOrderTableSelected([]);
    } else {
      setOrderTableSelected(data.orders.map((order) => order.id));
    }
  };

  const orderTableSelectionState = useMemo(() => {
    if (orderTableSelected.length == 0) return "none";
    if (orderTableSelected.length == orders.length) {
      return "all";
    }
    return "indeterminate";
  }, [orderTableSelected]);

  const overviewStat = useMemo(
    () => overviewStats[overviewDuration],
    [overviewDuration]
  );

  return {
    orderTableSelected,
    orderTableSelectionState,
    counters,
    orders,
    customerInteractions,
    recentMessages,
    overviewStat,
    overviewDuration,
    topCountries,
    setOverviewDuration,
    onOrderTableSelection,
    onOrderTableAllSelection,
  };
};

const [useEcommerceDashboard, EcommerceDashboardProvider] =
  createHookedContext(useHook);
export { useEcommerceDashboard, EcommerceDashboardProvider };
