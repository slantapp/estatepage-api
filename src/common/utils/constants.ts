const FALLBACK_MESSAGES = {
  RequestOk: 'Request completed successfully.',
  RequestAccepted: 'Request Accepted. Standby for status confirmation',
  ServiceUnavailableMsg:
    'We are currently unable to complete your request. Service is unavailable!',
  BadRequestMsg:
    'Invalid request. Check that your request if formed as required',
  UnauthorizedMsg: 'Unauthorized Access.',
  ForbiddenMsg:
    'Forbidden! You do not have the proper rights to access resource',
  NotFoundMsg: 'Resource Not Found.',
  UnprocessableEntityMsg:
    'Request Failed! We are unable to complete your request',
  InternalServerErrorMsg:
    "It's not you, it's us. We had a glitch and were unable to complete your request. Please try again",
  TimeOutMsg: 'Encountered an unexpected condition. The request has timed out',
};

export default FALLBACK_MESSAGES;
