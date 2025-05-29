'use client';

import React from 'react';
import { LoadForm } from '@/components/freight/LoadForm';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function FreightDashboardPage() {
  // Sample data for demonstration
  const drivers = [
    { id: 'driver1', name: 'John Doe' },
    { id: 'driver2', name: 'Jane Smith' },
    { id: 'driver3', name: 'Robert Johnson' },
  ];
  
  const customers = [
    { id: 'customer1', name: 'Acme Corporation' },
    { id: 'customer2', name: 'Global Shipping Inc.' },
    { id: 'customer3', name: 'East Coast Logistics' },
  ];

  const handleLoadSubmit = (data: any) => {
    console.log('Load data submitted:', data);
    // In a real application, this would send the data to the Supabase database
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Ultra21 Freight Management</h1>
      
      <div className="flex justify-between items-center mb-6">
        <p className="text-muted-foreground">
          Manage your loads, drivers, and customers in one place
        </p>
        <LoadForm 
          drivers={drivers} 
          customers={customers} 
          onSubmit={handleLoadSubmit} 
        />
      </div>
      
      <Tabs defaultValue="loads" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-8">
          <TabsTrigger value="loads">Loads</TabsTrigger>
          <TabsTrigger value="drivers">Drivers</TabsTrigger>
          <TabsTrigger value="customers">Customers</TabsTrigger>
        </TabsList>
        
        <TabsContent value="loads">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Chicago, IL to Detroit, MI</CardTitle>
                <CardDescription>Pickup: June 2, 2025</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-sm">
                  <div className="flex justify-between py-1">
                    <span className="text-muted-foreground">Status:</span>
                    <span className="font-medium">Available</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-muted-foreground">Distance:</span>
                    <span className="font-medium">300 miles</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-muted-foreground">Price:</span>
                    <span className="font-medium">$1,200.00</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-muted-foreground">Customer:</span>
                    <span className="font-medium">Acme Corporation</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>New York, NY to Boston, MA</CardTitle>
                <CardDescription>Pickup: June 5, 2025</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-sm">
                  <div className="flex justify-between py-1">
                    <span className="text-muted-foreground">Status:</span>
                    <span className="font-medium">Assigned</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-muted-foreground">Distance:</span>
                    <span className="font-medium">215 miles</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-muted-foreground">Price:</span>
                    <span className="font-medium">$950.00</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-muted-foreground">Customer:</span>
                    <span className="font-medium">Global Shipping Inc.</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-muted-foreground">Driver:</span>
                    <span className="font-medium">Jane Smith</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Miami, FL to Atlanta, GA</CardTitle>
                <CardDescription>Pickup: June 1, 2025</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-sm">
                  <div className="flex justify-between py-1">
                    <span className="text-muted-foreground">Status:</span>
                    <span className="font-medium">Delivered</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-muted-foreground">Distance:</span>
                    <span className="font-medium">661 miles</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-muted-foreground">Price:</span>
                    <span className="font-medium">$2,100.00</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-muted-foreground">Customer:</span>
                    <span className="font-medium">East Coast Logistics</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-muted-foreground">Driver:</span>
                    <span className="font-medium">Robert Johnson</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="drivers">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {drivers.map(driver => (
              <Card key={driver.id}>
                <CardHeader>
                  <CardTitle>{driver.name}</CardTitle>
                  <CardDescription>Driver ID: {driver.id}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-sm">
                    <div className="flex justify-between py-1">
                      <span className="text-muted-foreground">Status:</span>
                      <span className="font-medium">Active</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-muted-foreground">Completed Loads:</span>
                      <span className="font-medium">24</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-muted-foreground">Current Load:</span>
                      <span className="font-medium">None</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="customers">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {customers.map(customer => (
              <Card key={customer.id}>
                <CardHeader>
                  <CardTitle>{customer.name}</CardTitle>
                  <CardDescription>Customer ID: {customer.id}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-sm">
                    <div className="flex justify-between py-1">
                      <span className="text-muted-foreground">Status:</span>
                      <span className="font-medium">Active</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-muted-foreground">Total Loads:</span>
                      <span className="font-medium">12</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-muted-foreground">Active Loads:</span>
                      <span className="font-medium">3</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
