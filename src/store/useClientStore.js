import { create } from "zustand";
import { devtools } from "zustand/middleware";

const useClientStore = create(
  devtools((set) => {
    // Function to fetch bank statements
    const fetchBankStatements = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/bank-statements`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch bank statements");
        }
        const data = await response.json();
        set({
          allStatement: data.data
        });
      } catch (error) {
        console.error("Error fetching bank statements:", error);
      }
    };

    // Fetch bank statements automatically when the store initializes
    fetchBankStatements();

    return {
      clients: [],
      searchedClient: {},
      clientStatement: {},
      allStatement:[],
      recentStatement: [],
      specificRecord: [],
      hasVisitedClassification: false,
      searchValue: '',
   
      fetchBankStatements,
      
      setClients: (clients) => set({ clients }),
      setSearchedClient: (searchedClient) => set({ searchedClient }),
      setClientStatement: (clientStatement) => set({ clientStatement }),
      setAllBankStatement: (allStatement) => set({ allStatement }),
      setRecentStatement: (recentStatement) => set({ recentStatement }),
      setSpecificRecord: (specificRecord) => set({ specificRecord }),
      clearRecentStatement: () => set({ recentStatement: [] }),
      setHasVisitedClassification: (value) => set({ hasVisitedClassification: value }),
      setSearchValue: (value) => set({ searchValue: value }),
      resetSearch: () => set({ searchValue: '', searchedClient: {} }),
    };
  })
);

export default useClientStore;
