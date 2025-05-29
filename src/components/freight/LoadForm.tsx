import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

// Form schema
const loadFormSchema = z.object({
  pickupLocation: z.string().min(2, {
    message: 'Pickup location must be at least 2 characters.',
  }),
  deliveryLocation: z.string().min(2, {
    message: 'Delivery location must be at least 2 characters.',
  }),
  price: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: 'Price must be a valid number greater than 0.',
  }),
  weight: z.string().refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
    message: 'Weight must be a valid number.',
  }),
  status: z.enum(['available', 'assigned', 'in_transit', 'delivered', 'cancelled']),
  driverId: z.string().optional(),
  customerId: z.string().min(1, {
    message: 'Customer is required.',
  }),
});

type LoadFormValues = z.infer<typeof loadFormSchema>;

interface LoadFormProps {
  initialData?: LoadFormValues;
  drivers: { id: string; name: string }[];
  customers: { id: string; name: string }[];
  onSubmit: (data: LoadFormValues) => void;
}

export function LoadForm({ initialData, drivers, customers, onSubmit }: LoadFormProps) {
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(new Date());

  const form = useForm<LoadFormValues>({
    resolver: zodResolver(loadFormSchema),
    defaultValues: initialData || {
      pickupLocation: '',
      deliveryLocation: '',
      price: '',
      weight: '',
      status: 'available',
      driverId: '',
      customerId: '',
    },
  });

  function handleSubmit(values: LoadFormValues) {
    onSubmit(values);
    setIsDialogOpen(false);
  }

  // Get status badge color based on load status
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'available':
        return <Badge className="bg-blue-500">Available</Badge>;
      case 'assigned':
        return <Badge className="bg-yellow-500">Assigned</Badge>;
      case 'in_transit':
        return <Badge className="bg-purple-500">In Transit</Badge>;
      case 'delivered':
        return <Badge className="bg-green-500">Delivered</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-500">Cancelled</Badge>;
      default:
        return <Badge>Unknown</Badge>;
    }
  };

  return (
    <>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button>Create New Load</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>New Load</DialogTitle>
            <DialogDescription>
              Enter the details for the new freight load. Click save when you're done.
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <Tabs defaultValue="details" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="details">Details</TabsTrigger>
                  <TabsTrigger value="assignment">Assignment</TabsTrigger>
                </TabsList>
                
                <TabsContent value="details" className="space-y-4 py-4">
                  <FormField
                    control={form.control}
                    name="pickupLocation"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Pickup Location</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter pickup location" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="deliveryLocation"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Delivery Location</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter delivery location" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="price"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Price ($)</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="0.00" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="weight"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Weight (lbs)</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="0" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div>
                    <Label>Pickup Date</Label>
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      className="rounded-md border"
                    />
                  </div>
                </TabsContent>
                
                <TabsContent value="assignment" className="space-y-4 py-4">
                  <FormField
                    control={form.control}
                    name="customerId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Customer</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a customer" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectGroup>
                              <SelectLabel>Customers</SelectLabel>
                              {customers.map((customer) => (
                                <SelectItem key={customer.id} value={customer.id}>
                                  {customer.name}
                                </SelectItem>
                              ))}
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="driverId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Driver (Optional)</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a driver" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectGroup>
                              <SelectLabel>Drivers</SelectLabel>
                              {drivers.map((driver) => (
                                <SelectItem key={driver.id} value={driver.id}>
                                  {driver.name}
                                </SelectItem>
                              ))}
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Leave empty to keep the load available for assignment
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="available">Available</SelectItem>
                            <SelectItem value="assigned">Assigned</SelectItem>
                            <SelectItem value="in_transit">In Transit</SelectItem>
                            <SelectItem value="delivered">Delivered</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="pt-2">
                    <Label>Current Status:</Label>
                    <div className="mt-2">
                      {getStatusBadge(form.watch('status'))}
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              <DialogFooter>
                <Button type="submit">Save Load</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Example card showing how the components would look in a dashboard */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Recent Loads</CardTitle>
          <CardDescription>Manage your freight loads from one place</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2">
            <div className="flex items-center justify-between rounded-md border p-4">
              <div>
                <h4 className="font-semibold">Chicago, IL to Detroit, MI</h4>
                <p className="text-sm text-muted-foreground">June 2, 2025 · 300 miles</p>
              </div>
              <Badge className="bg-blue-500">Available</Badge>
            </div>
            <div className="flex items-center justify-between rounded-md border p-4">
              <div>
                <h4 className="font-semibold">New York, NY to Boston, MA</h4>
                <p className="text-sm text-muted-foreground">June 5, 2025 · 215 miles</p>
              </div>
              <Badge className="bg-yellow-500">Assigned</Badge>
            </div>
            <div className="flex items-center justify-between rounded-md border p-4">
              <div>
                <h4 className="font-semibold">Miami, FL to Atlanta, GA</h4>
                <p className="text-sm text-muted-foreground">June 1, 2025 · 661 miles</p>
              </div>
              <Badge className="bg-green-500">Delivered</Badge>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button variant="outline" className="w-full">View All Loads</Button>
        </CardFooter>
      </Card>
    </>
  );
}
