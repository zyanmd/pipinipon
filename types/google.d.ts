// types/google.d.ts
export interface IdConfiguration {
  client_id: string;
  auto_select?: boolean;
  callback?: (response: CredentialResponse) => void;
  login_uri?: string;
  native_callback?: (response: CredentialResponse) => void;
  cancel_on_tap_outside?: boolean;
  prompt_parent_id?: string;
  nonce?: string;
  context?: string;
  state_cookie_domain?: string;
  ux_mode?: "popup" | "redirect";
  allowed_parent_origin?: string | string[];
  intermediate_iframe_close_callback?: () => void;
  use_fedcm_for_button?: boolean;
  use_fedcm_for_prompt?: boolean;
}

export interface CredentialResponse {
  credential: string;
  select_by?:
    | "auto"
    | "user"
    | "user_1tap"
    | "user_2tap"
    | "btn"
    | "btn_confirm"
    | "btn_add_session"
    | "btn_confirm_add_session";
}

export interface GsiButtonConfiguration {
  type: "standard" | "icon";
  theme?: "outline" | "filled_blue" | "filled_black";
  size?: "large" | "medium" | "small";
  text?: "signin_with" | "signup_with" | "continue_with" | "signin";
  shape?: "rectangular" | "pill" | "circle" | "square";
  logo_alignment?: "left" | "center";
  width?: string;
  locale?: string;
  click_listener?: () => void;
}

export interface Accounts {
  id: {
    initialize: (config: IdConfiguration) => void;
    prompt: (callback?: (notification: PromptMomentNotification) => void) => void;
    renderButton: (parent: HTMLElement, options: GsiButtonConfiguration) => void;
    disableAutoSelect: () => void;
    storeCredential: (credential: { id: string; password: string }) => void;
    cancel: () => void;
    revoke: (hint: string, callback?: (response: { successful: boolean; error?: string }) => void) => void;
  };
}

export interface PromptMomentNotification {
  isDisplayMoment: () => boolean;
  isDisplayed: () => boolean;
  isNotDisplayed: () => boolean;
  getNotDisplayedReason: () => "browser_not_supported" | "invalid_client" | "missing_client_id" | "opt_out_or_no_session" | "secure_http_required" | "suppressed_by_user" | "unregistered_origin" | "unknown_reason";
  isSkippedMoment: () => boolean;
  getSkippedReason: () => "auto_cancel" | "user_cancel" | "tap_outside" | "issuing_failed";
  isDismissedMoment: () => boolean;
  getDismissedReason: () => "credential_returned" | "cancel_called" | "flow_restarted";
  getMomentType: () => "display" | "skipped" | "dismissed";
}

declare global {
  interface Window {
    google?: {
      accounts: Accounts;
    };
  }
}

export {};