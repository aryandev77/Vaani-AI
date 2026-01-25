import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default function SettingsPage() {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center">
        <h1 className="text-2xl font-semibold font-headline md:text-3xl">
          Settings
        </h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Application Settings</CardTitle>
          <CardDescription>
            Manage your application preferences.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>Settings page is under construction.</p>
        </CardContent>
      </Card>
    </div>
  );
}
