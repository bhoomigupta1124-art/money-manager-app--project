

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

function render() {
  list.innerHTML = "";

  app.transactions.forEach(t => {
    const row = `<tr>
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

    list.innerHTML += row;
  });

  const s = app.getSummary();
  document.getElementById("income").innerText = s.income;
  document.getElementById("expense").innerText = s.expense;
  document.getElementById("balance").innerText = s.balance;
}

function deleteTxn(id) {
  if (confirm("Delete?")) {
    app.delete(id);
    render();
  }
}

function editTxn(id) {
  const t = app.transactions.find(t => t.id === id);
  document.getElementById("amount").value = t.amount;
  document.getElementById("date").value = t.date;
  document.querySelector(`input[value=${t.type}]`).checked = true;
  document.getElementById("subcategory").value = t.subcategory;
  document.getElementById("desc").value = t.desc;

  app.editId = id;
  popup.classList.remove("hidden");
}

const popup = document.getElementById("popup");
document.getElementById("openForm").onclick = () => popup.classList.remove("hidden");
document.getElementById("closeForm").onclick = () => popup.classList.add("hidden");

const subMap = {
  income: ["Salary", "Bonus"],
  expense: ["Food", "Rent", "Shopping"]
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

// Form submit
document.getElementById("transactionForm").onsubmit = e => {
  e.preventDefault();

  const amount = Number(document.getElementById("amount").value);
  const date = document.getElementById("date").value;
  const type = document.querySelector("input[name=type]:checked")?.value;
  const sub = subSelect.value;
  const desc = document.getElementById("desc").value;

  if (!amount || amount <= 0) return alert("Invalid amount");
  if (!date) return alert("Invalid date");
  if (!type) return alert("Select type");
  if (!sub) return alert("Select subcategory");

  const txn = new Transaction(
    app.editId || Date.now().toString(),
    amount,
    date,
    type,
    sub,
    desc
  );

  try {
    if (app.editId) {
      app.update(txn);
      app.editId = null;
    } else {
      app.add(txn);
    }

    popup.classList.add("hidden");
    e.target.reset();
    render();
  } catch (err) {
    console.error(err);
  }
};

render();

