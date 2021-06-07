import Vue from "vue";
import { TYPE } from "vue-toastification";

export async function notifyConfirm<T>(promise: Promise<T>) {
  const toastId = Vue.$toast("Confirming...", {
    timeout: false,
    closeOnClick: false,
    hideProgressBar: false,
    draggable: false,
    icon: "lds-dual-ring",
  });

  try {
    await promise;
    Vue.$toast.update(toastId, {
      content: "Complete",
      options: {
        icon: undefined,
        timeout: 3_000,
        type: TYPE.SUCCESS,
        hideProgressBar: true,
      },
    });
  } catch (err) {
    Vue.$toast.update(toastId, {
      content: err.message,
      options: {
        icon: undefined,
        timeout: 3_000,
        type: TYPE.ERROR,
        hideProgressBar: true,
      },
    });
  }
}

export function notifyError(err: any) {
  Vue.$toast.error(err.message, {
    hideProgressBar: true,
    timeout: 3_000,
  });
}
