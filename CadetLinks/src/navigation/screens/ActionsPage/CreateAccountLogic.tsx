import { useState } from "react";
import { Alert } from "react-native";
import { ref, set } from "firebase/database";
import { db } from "../../../firebase/config";
import { initializeApp, getApps } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { CreateAccountForm } from "../../../assets/types";

const BLANK: CreateAccountForm = {
  classYear: "",
  lastName: "",
  firstName: "",
  cellPhone: "",
  schoolEmail: "",
  personalEmail: "",
  cadetRank: "",
  flight: "",
  job: "",
};

const isValidEmail = (email: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

const isValidPhone = (phone: string) =>
  /^\(?\d{3}\)?[\s\-]?\d{3}[\s\-]?\d{4}$/.test(phone.trim());

const formatPhone = (raw: string): string => {
  const digits = raw.replace(/\D/g, "");
  if (digits.length !== 10) return raw;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
};

const emailToKey = (email: string) =>
  email.trim().toLowerCase().replace(/@/g, "_").replace(/\./g, "_").replace(/-/g, "_");

const sanitizeKey = (str: string) =>
  str.trim().replace(/[\s\/\(\),\-]/g, "_");

const getSecondaryAuth = () => {
  const existing = getApps().find((a) => a.name === "secondary");
  if (existing) return getAuth(existing);

  const primaryApp = getApps().find((a) => a.name === "[DEFAULT]");
  if (!primaryApp) throw new Error("Firebase not initialized yet.");

  const secondary = initializeApp(primaryApp.options, "secondary");
  return getAuth(secondary);
};

export function useCreateAccountLogic() {
  const [modalVisible, setModalVisible] = useState(false);
  const [form, setForm] = useState<CreateAccountForm>(BLANK);
  const [saving, setSaving] = useState(false);

  const openModal = () => { setForm(BLANK); setModalVisible(true); };
  const closeModal = () => setModalVisible(false);

  const updateField = <K extends keyof CreateAccountForm>(
    key: K,
    value: CreateAccountForm[K]
  ) => setForm((prev) => ({ ...prev, [key]: value }));

  const updatePhone = (raw: string) => {
    const digits = raw.replace(/\D/g, "").slice(0, 10);
    let formatted = digits;
    if (digits.length >= 7) {
      formatted = `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
    } else if (digits.length >= 4) {
      formatted = `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    } else if (digits.length > 0) {
      formatted = `(${digits}`;
    }
    updateField("cellPhone", formatted);
  };

  const validate = (): string | null => {
    const { schoolEmail, personalEmail, firstName, lastName, cellPhone } = form;
    console.log("Validating form:", form);

    if (!firstName.trim() || !lastName.trim())
      return "First name and last name are required.";
    if (!schoolEmail.trim())
      return "School email is required.";
    if (!isValidEmail(schoolEmail))
      return "School email is not a valid email address.";
    if (personalEmail.trim() && !isValidEmail(personalEmail))
      return "Personal email is not a valid email address.";
    if (cellPhone.trim() && !isValidPhone(cellPhone))
      return "Phone number must be 10 digits, e.g. (555) 000-0000.";
    if (!form.cadetRank.trim())
      return "Please select a cadet rank.";
    if (!form.job.trim())
      return "Please select a job.";
    return null;
  };

const submit = async () => {
    console.log("Submitting form:", form);
    const validationError = validate();
    if (validationError) {
      Alert.alert("Invalid input", validationError);
      return;
    }

    setSaving(true);

    const password = "cadetlinks"; //TEMPORARY PASSWORD
    try {
      // Step 1 — Auth
      console.log("Step 1: Getting secondary auth...");
      const secondaryAuth = getSecondaryAuth();
      await createUserWithEmailAndPassword(secondaryAuth, form.schoolEmail.trim(), password);
      await secondaryAuth.signOut();
      console.log("Step 1: Auth done.");

      // Step 2 — Build cadet key
      const cadetId = emailToKey(form.schoolEmail);
      console.log("Step 2: cadetId =", cadetId);

      // Step 3 — Write cadet profile
      await set(ref(db, `cadets/${cadetId}`), {
        classYear:  form.classYear.trim(),
        lastName:   form.lastName.trim(),
        firstName:  form.firstName.trim(),
        cadetRank:  form.cadetRank.trim(),
        flight:     form.flight.trim(),
        job:        form.job.trim(),
        contact: {
          schoolEmail:   form.schoolEmail.trim().toLowerCase(),
          personalEmail: form.personalEmail.trim().toLowerCase(),
          cellPhone:     formatPhone(form.cellPhone),
        },
      });
      console.log("Step 3: Cadet profile written.");

      // Step 4 — classYear index
      const classYearKey = sanitizeKey(form.classYear.trim());
      console.log("Step 4: classYearKey =", classYearKey);
      if (classYearKey) {
        await set(
          ref(db, `indexes/classYear/${classYearKey}/${cadetId}`),
          true
        );
        console.log("Step 4: classYear index written.");
      } else {
        console.log("Step 4: SKIPPED — classYear was empty.");
      }

      // Step 5 — flight index
      const flightKey = sanitizeKey(form.flight.trim());
      console.log("Step 5: flightKey =", flightKey);
      if (flightKey) {
        await set(
          ref(db, `indexes/flight/${flightKey}/${cadetId}`),
          true
        );
        console.log("Step 5: flight index written.");
      } else {
        console.log("Step 5: SKIPPED — flight was empty.");
      }

      // Step 5 - Update Jobs
      
      if(form.job) {
        await set(
          ref(db, `indexes/job/${form.job}`),
          { [cadetId]: true }
        );
      } else{
        console.log(Error,"Skipped Updating jobs")
      }

      console.log("All steps complete!");
      Alert.alert("Account created", `${form.firstName} ${form.lastName} can now log in.`);
      closeModal();
    } catch (e: any) {
      console.log("ERROR code:", e?.code);
      console.log("ERROR message:", e?.message);
      Alert.alert("Error", e?.message ?? "Could not create account. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return {
    modalVisible, openModal, closeModal,
    form, updateField, updatePhone,
    saving, submit,
  };
}