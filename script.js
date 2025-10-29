document.addEventListener("DOMContentLoaded", () => {
  const callType = document.getElementById("callType");
  const clientFields = document.getElementById("clientFields");
  const riderFields = document.getElementById("riderFields");
  const rentalFields = document.getElementById("rentalFields");
  const form = document.getElementById("callingForm");
  const output = document.getElementById("output");
  const submitButton = form.querySelector("button[type='submit']");

  // 🔹 STEP 1: PASTE YOUR DEPLOYED GOOGLE APPS SCRIPT WEB APP URL HERE
  const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbxfizwu73WwNOT1UNyyosy0YDGop5Mw2wmw1HO0ULnt2WXa5dAh7o9cAef6_oRvww5xkg/exec";

  /**
   * Helper function to disable or enable all form fields within a parent element.
   */
  function setFieldsDisabled(element, disabled) {
    const inputs = element.querySelectorAll("input, select, textarea");
    inputs.forEach((input) => {
      input.disabled = disabled;
    });
  }

  // Hide all fields initially
  setFieldsDisabled(clientFields, true);
  setFieldsDisabled(riderFields, true);
  setFieldsDisabled(rentalFields, true);

  // Show fields depending on call type
  callType.addEventListener("change", () => {
    clientFields.classList.add("hidden");
    riderFields.classList.add("hidden");
    rentalFields.classList.add("hidden");

    setFieldsDisabled(clientFields, true);
    setFieldsDisabled(riderFields, true);
    setFieldsDisabled(rentalFields, true);

    if (callType.value === "client") {
      clientFields.classList.remove("hidden");
      setFieldsDisabled(clientFields, false);
    } else if (callType.value === "rider") {
      riderFields.classList.remove("hidden");
      setFieldsDisabled(riderFields, false);
    } else if (callType.value === "rental") {
      rentalFields.classList.remove("hidden");
      setFieldsDisabled(rentalFields, false);
    }
  });

  // 🔹 Form Submission
  form.addEventListener("submit", (e) => {
    e.preventDefault();

    if (!callType.value) {
      output.textContent = "❌ Please select a call type!";
      output.style.color = "red";
      return;
    }

    submitButton.disabled = true;
    output.textContent = "Submitting...";
    output.style.color = "#555";

    const type = callType.value;
    let data = { callType: type };

    // Collect data according to the type
    if (type === "client") {
      data.storeName = document.getElementById("storeName").value;
      data.number = document.getElementById("clientNumber").value;
      data.area = document.getElementById("clientArea").value;
      data.pincode = document.getElementById("clientPincode").value;
      data.remarks = document.getElementById("clientRemarks").value;
      data.status = document.getElementById("clientStatus").value;
    } else if (type === "rider") {
      data.fullName = document.getElementById("riderName").value;
      data.number = document.getElementById("riderNumber").value;
      data.area = document.getElementById("riderArea").value;
      data.pincode = document.getElementById("riderPincode").value;
      data.remarks = document.getElementById("riderRemarks").value;
      data.status = document.getElementById("riderStatus").value;
    } else if (type === "rental") {
      data.fullName = document.getElementById("rentalName").value;
      data.number = document.getElementById("rentalNumber").value;
      data.area = document.getElementById("rentalArea").value;
      data.pincode = document.getElementById("rentalPincode").value;
      data.remarks = document.getElementById("rentalRemarks").value;
      data.status = document.getElementById("rentalStatus").value;
    }

    // 🔹 Send Data to Apps Script Web App
    fetch(WEB_APP_URL, {
      method: "POST",
      mode: "no-cors", // required for Google Apps Script
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
      .then(() => {
        output.textContent = "✅ Data submitted successfully!";
        output.style.color = "green";
        form.reset();
        callType.value = "";
        clientFields.classList.add("hidden");
        riderFields.classList.add("hidden");
        rentalFields.classList.add("hidden");
      })
      .catch((err) => {
        console.error("Submission error:", err);
        output.textContent = "❌ Submission failed. Check console.";
        output.style.color = "red";
      })
      .finally(() => {
        submitButton.disabled = false;
      });
  });

  // --- 50-WORD LIMIT SCRIPT ---
  const wordLimit = 50;
  const textFields = document.querySelectorAll('input[type="text"], textarea');
  textFields.forEach((field) => {
    field.addEventListener("input", () => {
      let words = field.value.split(/\s+/).filter((w) => w.length > 0);
      if (words.length > wordLimit) {
        field.value = words.slice(0, wordLimit).join(" ");
      }
    });
  });
});




