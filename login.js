(function () {
  if (!window.argAuth) return;
  const loginForm = document.getElementById("login-form");
  const signupForm = document.getElementById("signup-form");
  const loginMsg = document.getElementById("login-msg");
  const signupMsg = document.getElementById("signup-msg");
  function getNext() {
    return new URLSearchParams(window.location.search).get("next") || "terminal.html";
  }
  loginForm?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const session = await window.argAuth.authenticate(document.getElementById("login-username").value, document.getElementById("login-password").value);
    if (!session) {
      loginMsg.textContent = "Access denied.";
      return;
    }
    window.location.href = getNext();
  });
  signupForm?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const result = await window.argAuth.signup(document.getElementById("signup-username").value, document.getElementById("signup-password").value);
    if (!result.ok) {
      signupMsg.textContent = result.error;
      return;
    }
    signupMsg.className = "success";
    signupMsg.textContent = "Account created. You can log in now.";
    signupForm.reset();
  });
})();
