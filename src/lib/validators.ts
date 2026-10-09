import { differenceInYears, isValid, parseISO } from "date-fns";

export const getAge = (iso: string) => differenceInYears(new Date(), parseISO(iso));

export const fullNameRules = {
  required: "Name is required",
  minLength: { value: 3, message: "Name must be at least 3 characters" },
  maxLength: { value: 50, message: "Name must not exceed 50 characters" },
};

export const emailRules = {
  required: "Email is required",
  pattern: { value: /^\S+@\S+\.\S+$/, message: "Please enter a valid email" },
};

export const mobileRules = {
  required: "Mobile number is required",
  validate: (v: string) => {
    const d = v.replace(/\s/g, "");
    if (!d.startsWith("5")) return "Georgian mobile numbers must start with 5";
    if (!/^\d+$/.test(d))
      return "Please enter a valid Georgian mobile number (9 digits starting with 5)";
    if (d.length !== 9) return "Mobile number must be exactly 9 digits";
    return true;
  },
};

export const dobRules = {
  required: "Date of birth is required",
  validate: (v: string) => {
    const date = parseISO(v);
    if (!isValid(date) || date > new Date()) return "Please enter a valid date of birth";
    if (getAge(v) < 12) return "You must be at least 12 years old to create an account";
    return true;
  },
};

export const cardNumberRules = {
  required: "Card number is required",
  validate: (v: string) => /^\d{16}$/.test(v.replace(/\s/g, "")) || "Card number must be 16 digits",
};

export const expiryRules = {
  required: "Expiry is required",
  validate: (v: string) => {
    const m = /^(\d{2})\/(\d{2})$/.exec(v.trim());
    if (!m) return "Use MM/YY format";
    const month = Number(m[1]);
    if (month < 1 || month > 12) return "Invalid month";
    // the card is valid through the end of its expiry month
    return new Date(2000 + Number(m[2]), month, 1) > new Date() || "Card has expired";
  },
};

export const cvvRules = {
  required: "CVV is required",
  pattern: { value: /^\d{3}$/, message: "CVV must be 3 digits" },
};
