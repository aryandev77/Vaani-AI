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
