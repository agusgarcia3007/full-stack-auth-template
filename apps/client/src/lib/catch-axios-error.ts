import { AxiosError } from "axios";
import { toast } from "sonner";
import i18n from "../i18n/config";

export function catchAxiosError(error: unknown) {
  const defaultMessage = i18n.t("common.unexpected_error");

  if (error instanceof AxiosError) {
    const errorCode = error.response?.data?.code;

    // If there's an error code, try to translate it
    const message = errorCode && i18n.exists(`errors.${errorCode}`)
      ? i18n.t(`errors.${errorCode}`)
      : error.response?.data?.message ||
        error.response?.data?.error ||
        defaultMessage;

    toast.error(message);
    return;
  }

  toast.error(defaultMessage);
}
