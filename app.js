// ======================= app.js =======================
class Transaction {
  constructor(id, amount, date, type, subcategory, desc) {
    this.id = id;
    this.amount = amount;
    this.date = date;
    this.type = type;
    this.subcategory = subcategory;
    this.desc = desc;
  }
}

class MoneyManager {
  constructor() {
    this.transactions = JSON.parse(localStorage.getItem("data")) || [];
    this.editId = null;
  }

  save() {
    localStorage.setItem("data", JSON.stringify(this.transactions));
  }

  add(txn) {
    this.transactions.push(txn);
    this.save();
  }

  delete(id) {
    this.transactions = this.transactions.filter(t => t.id !== id);
    this.save();
  }

  update(updatedTxn) {
    this.transactions = this.transactions.map(t =>
      t.id === updatedTxn.id ? updatedTxn : t
    );
    this.save();
  }

  getSummary() {
    let income = 0, expense = 0;
    this.transactions.forEach(t => {
      if (t.type === "income") income += t.amount;
      else expense += t.amount;
    });
    return { income, expense, balance: income - expense };
  }
}

const app = new MoneyManager();
const list = document.getElementById("list");

const subMap = {
  income: ["Salary", "Bonus", "Allowance", "Freelance"],
  expense: ["Food", "Rent", "Shopping", "Bills", "Travel"]
};

const subSelect = document.getElementById("subcategory");

document.querySelectorAll("input[name=type]").forEach(r => {
  r.onchange = () => {
    subSelect.innerHTML = "<option value=''>Select</option>";
    subMap[r.value].forEach(s => {
      subSelect.innerHTML += `<option>${s}</option>`;
    });
  };
});

function validate() {
  let valid = true;

  const amount = document.getElementById("amount");
  const date = document.getElementById("date");
  const type = document.querySelector("input[name=type]:checked");
  const sub = subSelect;

  document.querySelectorAll(".error").forEach(e => e.innerText = "");
  document.querySelectorAll("input, select").forEach(e => e.classList.remove("error-field"));

  if (!amount.value || amount.value <= 0) {
    document.getElementById("amountError").innerText = "Enter valid amount";
    amount.classList.add("error-field");
    valid = false;
  }

  if (!date.value) {
    document.getElementById("dateError").innerText = "Select date";
    date.classList.add("error-field");
    valid = false;
  }

  if (!type) {
    document.getElementById("typeError").innerText = "Select category";
    valid = false;
  }

  if (!sub.value) {
    document.getElementById("subError").innerText = "Select subcategory";
    sub.classList.add("error-field");
    valid = false;
  }

  return valid;
}

function render(data = app.transactions) {
  list.innerHTML = "";

  data.forEach(t => {
    list.innerHTML += `<tr>
      <td>${t.date}</td>
      <td>${t.type}</td>
      <td>${t.subcategory}</td>
      <td>${t.desc || "-"}</td>
      <td>${t.amount}</td>
      <td>
        <button onclick="editTxn('${t.id}')">Edit</button>
        <button onclick="deleteTxn('${t.id}')">Delete</button>
      </td>
    </tr>`;
  });

  const s = app.getSummary();
  income.innerText = s.income;
  expense.innerText = s.expense;
  balance.innerText = s.balance;
}

function deleteTxn(id) {
  if (confirm("Are you sure you want to delete this transaction?")) {
    app.delete(id);
    render();
  }
}

function editTxn(id) {
  const t = app.transactions.find(t => t.id === id);
  amount.value = t.amount;
  date.value = t.date;
  document.querySelector(`input[value=${t.type}]`).checked = true;
  subSelect.innerHTML = "";
  subMap[t.type].forEach(s => subSelect.innerHTML += `<option ${s===t.subcategory?'selected':''}>${s}</option>`);
  desc.value = t.desc;

  app.editId = id;
  popup.classList.remove("hidden");
}

openForm.onclick = () => popup.classList.remove("hidden");
closeForm.onclick = () => popup.classList.add("hidden");

transactionForm.onsubmit = e => {
  e.preventDefault();

  if (!validate()) return;

  const txn = new Transaction(
    app.editId || Date.now().toString(),
    Number(amount.value),
    date.value,
    document.querySelector("input[name=type]:checked").value,
    subSelect.value,
    desc.value
  );

  try {
    if (app.editId) {
      app.update(txn);
      app.editId = null;
    } else {
      app.add(txn);
    }

    popup.classList.add("hidden");
    transactionForm.reset();
    render();
  } catch (err) {
    console.error(err);
  }
};

// FILTER
filterType.onchange = () => {
  const val = filterType.value;
  render(val ? app.transactions.filter(t => t.type === val) : app.transactions);
};

// SORT
sortAmount.onchange = () => {
  let sorted = [...app.transactions];
  if (sortAmount.value === "high") sorted.sort((a,b)=>b.amount-a.amount);
  if (sortAmount.value === "low") sorted.sort((a,b)=>a.amount-b.amount);
  render(sorted);
};

// CSV DOWNLOAD
function downloadCSV() {
  let csv = "Date,Type,Subcategory,Description,Amount\n";
  app.transactions.forEach(t => {
    csv += `${t.date},${t.type},${t.subcategory},${t.desc},${t.amount}\n`;
  });

  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "transactions.csv";
  a.click();
}

render();