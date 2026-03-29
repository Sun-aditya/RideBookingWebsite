import { useState } from "react";
import { CreditCard, Wallet } from "lucide-react";
import toast from "react-hot-toast";
import Card from "../components/ui/Card";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import { PAYMENT_HISTORY } from "../utils/constants";

export default function PaymentPage() {
  const [cardForm, setCardForm] = useState({ number: "", expiry: "", cvv: "", holder: "" });

  const addCard = (event) => {
    event.preventDefault();
    console.log("Add new card", cardForm);
    toast.success("Card added successfully");
    setCardForm({ number: "", expiry: "", cvv: "", holder: "" });
  };

  return (
    <div className="mt-6 grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
      <section className="space-y-4">
        <Card>
          <h1 className="mb-3 text-2xl font-bold">Saved Cards</h1>
          <div className="rounded-2xl border border-brand-mediumGray bg-gradient-to-br from-[#1f1f1f] to-[#090909] p-5">
            <div className="mb-8 flex items-start justify-between">
              <p className="text-sm text-gray-400">VISA</p>
              <Badge variant="warning">Default</Badge>
            </div>
            <p className="text-lg tracking-[0.2em]">**** **** **** 4821</p>
            <div className="mt-4 flex items-center justify-between text-sm text-gray-400">
              <span>Alex Rider</span>
              <span>12/28</span>
            </div>
          </div>
        </Card>

        <Card>
          <h2 className="mb-3 text-lg font-bold">Add New Card</h2>
          <form className="grid gap-3" onSubmit={addCard}>
            <Input
              label="Card Number"
              icon={CreditCard}
              placeholder="1234 5678 9012 3456"
              value={cardForm.number}
              onChange={(e) => setCardForm((prev) => ({ ...prev, number: e.target.value }))}
            />
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Expiry"
                placeholder="MM/YY"
                value={cardForm.expiry}
                onChange={(e) => setCardForm((prev) => ({ ...prev, expiry: e.target.value }))}
              />
              <Input
                label="CVV"
                type="password"
                placeholder="123"
                value={cardForm.cvv}
                onChange={(e) => setCardForm((prev) => ({ ...prev, cvv: e.target.value }))}
              />
            </div>
            <Input
              label="Cardholder Name"
              placeholder="Name on card"
              value={cardForm.holder}
              onChange={(e) => setCardForm((prev) => ({ ...prev, holder: e.target.value }))}
            />
            <Button type="submit">Add Card</Button>
          </form>
        </Card>
      </section>

      <section className="space-y-4">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Wallet Balance</p>
              <p className="text-2xl font-bold">₹1,250</p>
            </div>
            <Wallet className="h-8 w-8 text-brand-yellow" />
          </div>
          <Button
            className="mt-4 w-full"
            onClick={() => {
              console.log("Wallet top-up initiated");
              toast("Top-up flow coming soon");
            }}
          >
            Top Up Wallet
          </Button>
        </Card>

        <Card>
          <h2 className="mb-3 text-lg font-bold">Payment History</h2>
          <div className="space-y-2">
            {PAYMENT_HISTORY.map((payment) => (
              <div
                key={payment.id}
                className="flex items-center justify-between rounded-xl border border-brand-mediumGray bg-black/30 px-3 py-2"
              >
                <div>
                  <p className="text-sm font-medium">{payment.destination}</p>
                  <p className="text-xs text-gray-500">{payment.date}</p>
                </div>
                <p className="font-semibold">{payment.amount}</p>
              </div>
            ))}
          </div>
        </Card>
      </section>
    </div>
  );
}
