# Forgot Password

Forgot password opens an in app `SFSafariController`.  This controller functions like an iframe, that is embedded in a modal. This controller can pull in web content. The forgot password flow will reuse as much of site's forgot password functionality as possible.

For the mobile experience, it's important that these pages are optimized for the mobile expereince. That means different backgrounds, and no footer. Calls to action to return to the app, should close the safari controller. 

```mermaid
    graph TD

        subgraph site experience
        clickForgotWeb((clicks forgot password)) --> lostViewWeb(opens /auth/lost/view) --> sendEmailWeb(submit form/triggers email) --> doneEmailWeb(email sent message) --> checkEmailWeb((CTA to login))
        clickEmailLinkWeb((clicks link in email)) --> opensResetWeb(open /auth/lost/reset/*) --> submitFormWeb(user submits form) --> success2Web(success message) --> webSuccessMessage((CTA to login))
        end

        subgraph mobile experience
        clickForgotMobile((clicks forgot password)) --> lostViewMobile(opens /auth/lost/mobile-view) --> sendEmailMobile(submits form/triggers email) --> doneEmailMobile(email sent message) --> checkEmailMobile((CTA return to app))
        clickEmailMobile((clicks link in email)) --> openResetMobile(open /auth/lost/mobile-reset/*) --> submitFormMobile(user submits form) --> success2Mobile(successMessage) --> mobileSuccessMessage((CTA return to app))
        end
```
