import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default function BillingPage() {
  return (
    <div className="flex flex-col gap-8">
      <Card>
        <CardHeader>
          <CardTitle>Billing & Subscriptions</CardTitle>
          <CardDescription>
            Manage your billing information and subscription plan.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>Billing page is under construction.</p>
        </CardContent>
      </Card>
    </div>
  );
}
