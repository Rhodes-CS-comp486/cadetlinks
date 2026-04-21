import { useState } from "react";
import { Alert } from "react-native";
import { CreateAccountForm } from "../../../assets/types";
import { createCadetAccount, formatPhoneNumber } from "../../../firebase/dbController";

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
    const validationError = validate();
    if (validationError) {
      Alert.alert("Invalid input", validationError);
      return;
    }

    setSaving(true);
    try {
      await createCadetAccount({
        firstName: form.firstName,
        lastName: form.lastName,
        cadetRank: form.cadetRank,
        classYear: form.classYear,
        flight: form.flight,
        job: form.job,
        schoolEmail: form.schoolEmail,
        personalEmail: form.personalEmail,
        cellPhone: form.cellPhone,
      });

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