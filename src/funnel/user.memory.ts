export interface UserMemory {
  email?: string;
  goal?: string;
  purchased?: string[];
}

export const userMemory: UserMemory = {
  purchased: [],
};
