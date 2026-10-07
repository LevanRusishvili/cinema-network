import { addDays, format } from "date-fns";

export const toApiDate = (d: Date) => format(d, "yyyy-MM-dd");
export const today = () => toApiDate(new Date());
export const nextSevenDays = () =>
  Array.from({ length: 7 }, (_, i) => toApiDate(addDays(new Date(), i)));
