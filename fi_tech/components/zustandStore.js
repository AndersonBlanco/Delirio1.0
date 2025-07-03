import * as Zustand from "zustand"; 

export const useUserState = Zustand.create((set) => ({
    userStrikes: 0,
    userStrikedOut: false, 
    incrementUserStrikes: () => set(x => {
      const newCount = x.userStrikes + 1
      return {
        userStrikes: newCount,
        userStrikedOut: newCount >= 3,
      }
    }),
     resetUserStrikes: () =>
    set(() => ({
      userStrikes: 0,
      userStrikedOut: false,
    })),
}));

