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
      <div className="flex items-center">
        <h1 className="text-2xl font-semibold font-headline md:text-3xl">
          Billing
        </h1>
      </div>
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
