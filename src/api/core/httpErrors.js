export const handledAuthRedirect = "handledAuthRedirect";

export const isHandledAuthRedirect = (error) =>
  error?.[handledAuthRedirect] === true;

