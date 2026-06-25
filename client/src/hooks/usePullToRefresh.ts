import { useState, useCallback } from "react";

export function usePullToRefresh(
	refreshFunction: () => Promise<void>
) {
	const [refreshing, setRefreshing] = useState(false);

	const onRefresh = useCallback(async () => {
		try {
			setRefreshing(true);
			await refreshFunction();
		} catch (error) {
			console.log("Refresh error:", error);
		} finally {
			setRefreshing(false);
		}
	}, [refreshFunction]);

	return {
		refreshing,
		onRefresh,
	};
}