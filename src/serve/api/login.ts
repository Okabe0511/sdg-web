import http from "..";
import { store } from "/@/store/index";

export const login = (data: { account: string; password: string }) =>
  http.post("/account/login", { ...data });
