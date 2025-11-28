  document.addEventListener("DOMContentLoaded", () => {

  const callType = document.getElementById("callType");

  const clientUniversalFields = document.getElementById("clientUniversalFields");
  const clientFields = document.getElementById("clientFields");

  const riderFields = document.getElementById("riderFields");
  const riderStatus = document.getElementById("riderStatus");
  const riderDetails = document.getElementById("riderDetails");

  const rentalFields = document.getElementById("rentalFields");
  const rentalStatus = document.getElementById("rentalStatus");      // ✅ FIXED (missing before)
  const rentalDetails = document.getElementById("rentalDetails");    // ✅ FIXED (missing before)
  const rentalRequirement = document.getElementById("rentalRequirement");

  const riderNeededBox = document.getElementById("riderNeededBox");  // ❗ not "riderNeeded"
  const riderNeeded = document.getElementById("riderNeeded");

  const form = document.getElementById("callingForm");
  const output = document.getElementById("output");

  const statusMain = document.getElementById("clientStatusMain");
  const remarkField = document.getElementById("c_remark");
  const reasonField = document.getElementById("c_reason");
  const reasonLabel = document.getElementById("c_reason_label");

  const WEB_APP_URL =
    "https://script.google.com/macros/s/AKfycbwEdKrSWTrZOkhcRcXrv8wMP8zWtQkCp03rMVNDjGHhTPRTGLPQLngJU2pWwp4y_LnQhw/exec";

  function hideAll() {
    clientUniversalFields.classList.add("hidden");
    clientFields.classList.add("hidden");
    riderFields.classList.add("hidden");
    rentalFields.classList.add("hidden");
  }

  hideAll();

  callType.addEventListener("change", () => {
    hideAll();
    if (callType.value === "client") clientUniversalFields.classList.remove("hidden");
    else if (callType.value === "rider") riderFields.classList.remove("hidden");
    else if (callType.value === "rental") rentalFields.classList.remove("hidden");
  });

  /* -------------------- CLIENT LOGIC -------------------- */

  statusMain.addEventListener("change", () => {
    const status = statusMain.value;
    clientFields.classList.add("hidden");
    if (status === "Interested" || status === "Thinking") clientFields.classList.remove("hidden");
  });

  remarkField.addEventListener("change", () => {
    if (remarkField.value === "Rejected") {
      reasonLabel.classList.remove("hidden");
      reasonField.classList.remove("hidden");
    } else {
      reasonLabel.classList.add("hidden");
      reasonField.classList.add("hidden");
      reasonField.value = "";
    }
  });

  /* -------------------- RIDER LOGIC -------------------- */

  riderStatus.addEventListener("change", () => {
    if (riderStatus.value === "Interested" || riderStatus.value === "Deciding") {
      riderDetails.classList.remove("hidden");
    } else {
      riderDetails.classList.add("hidden");
    }
  });

    /* -------------------- RENTAL LOGIC -------------------- */

  rentalStatus.addEventListener("change", () => {
    const rs = rentalStatus.value;

    if (rs === "Interested" || rs === "Deciding") {
      rentalDetails.classList.remove("hidden");
    } else {
      rentalDetails.classList.add("hidden");
    }
  });

  /* -------------------- RENTAL REQUIREMENT LOGIC -------------------- */

  rentalRequirement.addEventListener("change", () => {
    if (rentalRequirement.value === "scootywithrider") {
      riderNeededBox.classList.remove("hidden");
    } else {
      riderNeededBox.classList.add("hidden");
      riderNeeded.value = "";
    }
  });

  /* -------------------- RIDER TYPE (if future needed) -------------------- */

  const riderType = document.getElementById("riderType");
  if (riderType) {
    riderType.addEventListener("change", () => {});
  }

  /* -------------------- Debounce + utils -------------------- */

  function debounce(fn, delay = 600) {
    let t;
    return function (...args) {
      clearTimeout(t);
      t = setTimeout(() => fn.apply(this, args), delay);
    };
  }

  function convertDDMMYYYYtoYYYYMMDD(value) {
    if (!value) return "";
    const normalized = value.replace(/\//g, "-").trim();
    const parts = normalized.split("-");
    if (parts.length !== 3) return "";
    const [dd, mm, yyyy] = parts;
    return `${yyyy}-${mm}-${dd}`;
  }

  async function lookupMobile(sheetName, mobile) {
    if (!mobile || mobile.length !== 10) return null;

    const url = `${WEB_APP_URL}?action=lookup&sheet=${sheetName}&mobile=${mobile}`;

    try {
      const resp = await fetch(url);
      if (!resp.ok) return null;
      return await resp.json();
    } catch (err) {
      console.error("Lookup failed:", err);
      return null;
    }
  }

  /* -------------------- CLIENT LOOKUP -------------------- */

  const clientNumberInput = document.getElementById("clientMainNumber");

  const handleClientLookup = debounce(async () => {
    const mobile = clientNumberInput.value.trim();
    if (mobile.length !== 10) return;

    output.textContent = "⏳ Checking client record...";

    const res = await lookupMobile("Client", mobile);

    if (res && res.status === "found" && res.row) {
      output.textContent = "✅ Client found — auto-filled.";
      populateClientFieldsFromRow(res.row);
    } else {
      output.textContent = "ℹ️ No record. New entry.";
      clearClientFields();
    }
  });

  clientNumberInput.addEventListener("input", handleClientLookup);

  /* -------------------- RIDER LOOKUP -------------------- */

  const riderNumberInput = document.getElementById("riderNumber");

  const handleRiderLookup = debounce(async () => {
    const mobile = riderNumberInput.value.trim();
    if (mobile.length !== 10) return;

    output.textContent = "⏳ Checking rider record...";

    const res = await lookupMobile("Rider", mobile);

    if (res && res.status === "found" && res.row) {
      output.textContent = "✅ Rider found — auto-filled.";
      populateRiderFieldsFromRow(res.row);
    } else {
      output.textContent = "ℹ️ No record. New entry.";
      clearRiderFields();
    }
  });

  riderNumberInput.addEventListener("input", handleRiderLookup);

  /* -------------------- RENTAL LOOKUP -------------------- */

const rentalNumberInput = document.getElementById("rentalNumber");

const handleRentalLookup = debounce(async () => {
  const mobile = rentalNumberInput.value.trim();
  if (mobile.length !== 10) return;

  output.textContent = "⏳ Checking rental record...";

  const res = await lookupMobile("Rental", mobile);

  if (res && res.status === "found" && res.row) {
    output.textContent = "✅ Rental record found — auto-filled.";
    populateRentalFieldsFromRow(res.row);
  } else {
    output.textContent = "ℹ️ No record. New rental entry.";
    clearRentalFields();
  }
});

rentalNumberInput.addEventListener("input", handleRentalLookup);


  /* -------------------- POPULATE / CLEAR CLIENT -------------------- */

  function populateClientFieldsFromRow(row) {
    clientUniversalFields.classList.remove("hidden");
    clientFields.classList.remove("hidden");

    document.getElementById("clientMainNumber").value = row[1] || "";
    document.getElementById("clientStatusMain").value = row[2] || "";

    document.getElementById("c_fullname").value = row[3] || "";
    document.getElementById("c_store").value = row[4] || "";
    document.getElementById("c_business").value = row[5] || "";
    document.getElementById("c_area").value = row[6] || "";
    document.getElementById("c_rider_type").value = row[7] || "";
    document.getElementById("c_gst").value = row[8] || "";
    document.getElementById("c_purpose").value = row[9] || "";
    document.getElementById("c_remark").value = row[10] || "";
    document.getElementById("c_reason").value = row[11] || "";

    if (row[10] === "Rejected") {
      reasonLabel.classList.remove("hidden");
      reasonField.classList.remove("hidden");
    } else {
      reasonLabel.classList.add("hidden");
      reasonField.classList.add("hidden");
    }

    const st = row[2];
    if (st === "Interested" || st === "Thinking") clientFields.classList.remove("hidden");
    else clientFields.classList.add("hidden");
  }

  function clearClientFields() {
    document.getElementById("c_fullname").value = "";
    document.getElementById("c_store").value = "";
    document.getElementById("c_business").value = "";
    document.getElementById("c_area").value = "";
    document.getElementById("c_rider_type").value = "";
    document.getElementById("c_gst").value = "";
    document.getElementById("c_purpose").value = "";
    document.getElementById("c_remark").value = "";
    document.getElementById("c_reason").value = "";
    reasonLabel.classList.add("hidden");
    reasonField.classList.add("hidden");
  }

  /* -------------------- POPULATE / CLEAR RIDER -------------------- */

  function populateRiderFieldsFromRow(row) {
    riderFields.classList.remove("hidden");

    document.getElementById("riderNumber").value = row[1] || "";
    document.getElementById("riderStatus").value = row[2] || "";
    document.getElementById("riderName").value = row[3] || "";
    document.getElementById("riderArea").value = row[4] || "";
    document.getElementById("riderPincode").value = row[5] || "";
    document.getElementById("riderRemarks").value = row[6] || "";
    document.getElementById("riderDL").value = row[7] || "";

    document.getElementById("riderInterview").value = convertDDMMYYYYtoYYYYMMDD(row[8]);
    document.getElementById("riderSchedule2").value = convertDDMMYYYYtoYYYYMMDD(row[9]);
    document.getElementById("riderSchedule3").value = convertDDMMYYYYtoYYYYMMDD(row[10]);

    if (row[2] === "Interested" || row[2] === "Deciding") {
      riderDetails.classList.remove("hidden");
    } else {
      riderDetails.classList.add("hidden");
    }
  }

  function clearRiderFields() {
    document.getElementById("riderName").value = "";
    document.getElementById("riderArea").value = "";
    document.getElementById("riderPincode").value = "";
    document.getElementById("riderRemarks").value = "";
    document.getElementById("riderDL").value = "";
    document.getElementById("riderInterview").value = "";
    document.getElementById("riderSchedule1").value = "";
    document.getElementById("riderSchedule2").value = "";
  }

  /* -------------------- POPULATE / CLEAR RENTAL -------------------- */

function populateRentalFieldsFromRow(row) {

  rentalFields.classList.remove("hidden");
  rentalDetails.classList.remove("hidden");

  document.getElementById("rentalNumber").value = row[1] || "";
  document.getElementById("rentalStatus").value = row[2] || "";
  document.getElementById("rentalName").value = row[3] || "";
  document.getElementById("rentalArea").value = row[4] || "";
  document.getElementById("rentalPincode").value = row[5] || "";
  document.getElementById("rentalRemarks").value = row[6] || "";
  document.getElementById("rentalPurpose").value = row[7] || "";
  document.getElementById("rentalRequirement").value = row[8] || "";

  // Rider needed (only apply if requirement was scooty with rider)
  if (row[8] === "scootywithrider") {
    riderNeededBox.classList.remove("hidden");
    document.getElementById("riderNeeded").value = row[9] || "";
  } else {
    riderNeededBox.classList.add("hidden");
  }

  document.getElementById("rentalSchedule2").value =
    convertDDMMYYYYtoYYYYMMDD(row[10]);

  document.getElementById("rentalSchedule3").value =
    convertDDMMYYYYtoYYYYMMDD(row[11]);
}

function clearRentalFields() {
  document.getElementById("rentalName").value = "";
  document.getElementById("rentalArea").value = "";
  document.getElementById("rentalPincode").value = "";
  document.getElementById("rentalRemarks").value = "";
  document.getElementById("rentalPurpose").value = "";
  document.getElementById("rentalRequirement").value = "";
  document.getElementById("riderNeeded").value = "";
  document.getElementById("rentalSchedule2").value = "";
  document.getElementById("rentalSchedule3").value = "";
  riderNeededBox.classList.add("hidden");
}


  /* -------------------- FORM SUBMIT -------------------- */

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (!callType.value) {
      output.textContent = "❌ Please select call type!";
      return;
    }

    let data = { callType: callType.value };

    /* -------------------- CLIENT SUBMIT -------------------- */
    if (callType.value === "client") {
      const number = document.getElementById("clientMainNumber").value.trim();
      const status = statusMain.value;

      if (!number || number.length !== 10) {
        output.textContent = "❌ Enter valid client mobile!";
        return;
      }

      if (!status) {
        output.textContent = "❌ Select status!";
        return;
      }

      data.number = number;
      data.status = status;

      if (status === "Interested" || status === "Thinking") {
        const fullname = document.getElementById("c_fullname").value.trim();
        const storeName = document.getElementById("c_store").value.trim();
        const business = document.getElementById("c_business").value.trim();
        const area = document.getElementById("c_area").value.trim();
        const riderType = document.getElementById("c_rider_type").value;
        const gst = document.getElementById("c_gst").value;
        const purpose = document.getElementById("c_purpose").value.trim();
        const remark = remarkField.value;
        const reason = reasonField.value.trim();

        if (status === "Interested") {
          if (!fullname || !storeName || !business || !area || !riderType || !gst || !purpose || !remark) {
            output.textContent = "❌ Fill all required fields!";
            return;
          }
        }

        if (remark === "Rejected" && !reason) {
          output.textContent = "❌ Enter reason!";
          return;
        }

        data.fullname = fullname;
        data.storeName = document.getElementById("c_store").value.trim();
        data.business = business;
        data.area = area;
        data.riderType = riderType;
        data.gst = gst;
        data.purpose = purpose;
        data.remark = remark;
        data.reason = reason;
      }
    }

    /* -------------------- RIDER SUBMIT -------------------- */
    if (callType.value === "rider") {
      const rMobile = document.getElementById("riderNumber").value.trim();
      const rStatus = document.getElementById("riderStatus").value;

      if (!rMobile || rMobile.length !== 10) {
        output.textContent = "❌ Enter rider mobile!";
        return;
      }

      if (!rStatus) {
        output.textContent = "❌ Select rider status!";
        return;
      }

      data.riderMobile = rMobile;
      data.riderStatus = rStatus;

      if (rStatus === "Interested" || rStatus === "Deciding") {
        data.riderName = document.getElementById("riderName").value.trim();
        data.riderArea = document.getElementById("riderArea").value.trim();
        data.riderPincode = document.getElementById("riderPincode").value.trim();
        data.riderRemarks = document.getElementById("riderRemarks").value.trim();
        data.riderDL = document.getElementById("riderDL").value;
        data.interviewDate = document.getElementById("riderInterview").value;
        data.schedule2 = document.getElementById("riderSchedule2").value;
        data.schedule3 = document.getElementById("riderSchedule3").value;

        if (rStatus === "Interested") {
          if (!data.riderName || !data.riderArea || !data.riderPincode ||
              !data.riderDL || !data.interviewDate) {
            output.textContent = "❌ Fill all required fields!";
            return;
          }
        }
      }
    }

    /* -------------------- RENTAL SUBMIT -------------------- */
if (callType.value === "rental") {

  const rNumber = document.getElementById("rentalNumber").value.trim();
  const rStatus = document.getElementById("rentalStatus").value;
  const rName = document.getElementById("rentalName").value.trim();
  const rArea = document.getElementById("rentalArea").value.trim();
  const rPincode = document.getElementById("rentalPincode").value.trim();
  const rRemarks = document.getElementById("rentalRemarks").value.trim();
  
  const rPurpose = document.getElementById("rentalPurpose").value.trim();
  const rRequirement = document.getElementById("rentalRequirement").value;

  // ✅ FIXED HERE
  const rRiderNeeded = document.getElementById("riderNeeded").value;

  const rSchedule2 = document.getElementById("rentalSchedule2").value;
  const rSchedule3 = document.getElementById("rentalSchedule3").value;

  if (!rNumber || rNumber.length !== 10) {
    output.textContent = "❌ Enter valid rental mobile!";
    return;
  }

  if (!rRequirement) {
    output.textContent = "❌ Select requirement!";
    return;
  }

  // only check when scooty-with-rider
  if (rRequirement === "scootywithrider" && !rRiderNeeded) {
    output.textContent = "❌ Select rider preference!";
    return;
  }

  data.rentalName = rName;
  data.rentalNumber = rNumber;
  data.rentalArea = rArea;
  data.rentalPincode = rPincode;
  data.rentalRemarks = rRemarks;
  data.rentalStatus = rStatus;
  data.rentalPurpose = rPurpose;
  data.rentalRequirement = rRequirement;
  data.riderNeeded = rRiderNeeded;
  data.rentalSchedule2 = rSchedule2;
  data.rentalSchedule3 = rSchedule3;
}


    /* -------------------- SEND -------------------- */

    try {
      const resp = await fetch(WEB_APP_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      let json;
      try {
        json = await resp.json();
      } catch {
        json = null;
      }

      if (json && json.status === "success") {
        output.style.color = "green";
        output.textContent = "✅ Submitted!";
        form.reset();
        hideAll();
      } else if (resp.ok) {
        output.style.color = "green";
        output.textContent = "✅ Submitted!";
        form.reset();
        hideAll();
      } else {
        output.style.color = "red";
        output.textContent = "❌ Server error!";
      }
    } catch (err) {
      output.style.color = "red";
      output.textContent = "❌ Submit failed: " + err.message;
    }
  });

  /* -------------------- 50-WORD LIMIT -------------------- */
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











