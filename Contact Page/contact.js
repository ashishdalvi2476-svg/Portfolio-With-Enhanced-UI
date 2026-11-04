
const contactForm = document.getElementById('contact-form');
const successPanel = document.getElementById('success-panel');
const formError = document.getElementById('form-error');
const successName = document.getElementById('success-name');

const submitBtn = contactForm?.querySelector('button[type="submit"]');

contactForm?.addEventListener('submit', async (event) => {
    event.preventDefault();

    formError.hidden = true;

    // 1. Browser validation
    if (!contactForm.reportValidity()) {
        formError.textContent = "Please fill in all required fields correctly.";
        formError.hidden = false;
        return;
    }

    // 2. Get form values
    const formData = new FormData(contactForm);

    const name = String(formData.get('name') || '').trim();
    const phone = String(formData.get('phone') || '').trim();
    const reason = String(formData.get('reason') || '').trim();

    const phonePattern = /^[+0-9() .-]{8,20}$/;

    if (
        name.length < 2 ||
        !phonePattern.test(phone) ||
        reason.length < 10
    ) {
        formError.textContent = "Please enter valid details.";
        formError.hidden = false;
        return;
    }

    // 3. Add Web3Forms details
    formData.set("access_key", "54febea1-b2b2-4137-83ee-4243741837d4");

    formData.set("subject", `New Portfolio Enquiry - ${name}`);

    // 4. Show loading state
    const originalText = submitBtn.textContent;

    submitBtn.textContent = "Sending...";
    submitBtn.disabled = true;

    try {
        // 5. Send data to Web3Forms
        const response = await fetch(
            "https://api.web3forms.com/submit",
            {
                method: "POST",
                body: formData
            }
        );

        const data = await response.json();

        // 6. Check actual API success
        if (!response.ok || !data.success) {
            throw new Error(
                data.message || "Unable to send your message."
            );
        }

        console.log("Web3Forms submission successful:", data);

        // 7. Show your existing success screen
        successName.textContent = name.split(/\s+/)[0];

        contactForm.reset();
        contactForm.hidden = true;
        successPanel.hidden = false;

        successPanel.scrollIntoView({
            behavior: window.matchMedia(
                '(prefers-reduced-motion: reduce)'
            ).matches ? 'auto' : 'smooth',
            block: 'nearest'
        });

    } catch (error) {
        console.error("Contact form submission failed:", error);

        formError.textContent =
            error.message || "Something went wrong. Please try again.";

        formError.hidden = false;

    } finally {
        // 8. Restore button
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
});
