
'use client';

import { useEffect, useState } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Loader2,
  Search,
  ShieldAlert,
  MoreHorizontal,
  Trash2,
  Download,
  CheckCircle,
  MessageSquare,
  Bell,
  X,
} from 'lucide-react';
import {
  getBookings,
  deleteAllBookings,
  deleteBooking,
  updateBookingStatus,
} from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';


type Booking = {
  id: string;
  name: string;
  email: string;
  phone: string;
  service: string;
  date: string;
  postcode: string;
  notes?: string;
  status: 'confirmed' | 'cancelled' | 'completed';
  createdAt: string;
  bookingNumber: string;
};

export default function AdminDashboard() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [newBookings, setNewBookings] = useState<Booking[]>([]);
  const [showNewBookingsModal, setShowNewBookingsModal] = useState(false);
  const { toast } = useToast();

  async function fetchData() {
    setIsLoading(true);
    setError(null);
    try {
      const fetchedBookings = (await getBookings()) as Booking[];
      if (!Array.isArray(fetchedBookings)) {
        // This handles cases where the server action might fail and not return an array
        throw new Error('Received invalid data for bookings.');
      }
      setBookings(fetchedBookings);

      const lastLogin = localStorage.getItem('lastAdminLogin');
      if (lastLogin) {
        const newSinceLastLogin = fetchedBookings.filter(b => {
            try {
                return new Date(b.createdAt) > new Date(lastLogin);
            } catch {
                return false; // Ignore invalid dates
            }
        });
        setNewBookings(newSinceLastLogin);
        if (newSinceLastLogin.length > 0) {
            setShowNewBookingsModal(true);
        }
      }

      localStorage.setItem('lastAdminLogin', new Date().toISOString());

    } catch (err: any) {
      setError(err.message || 'Failed to fetch bookings. Please ensure the server is configured correctly and try again.');
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  const handleDownloadPdf = () => {
    const doc = new jsPDF();
    autoTable(doc, {
      head: [
        [
          'Booking No.',
          'Name',
          'Service',
          'Appt. Date',
          'Status',
          'Booked On',
        ],
      ],
      body: filteredBookings.map(b => [
        b.bookingNumber,
        b.name,
        b.service,
        b.date,
        b.status,
        new Date(b.createdAt).toLocaleDateString(),
      ]),
    });
    doc.save('bookings.pdf');
  };

  const handleDeleteAll = async () => {
    try {
      await deleteAllBookings();
      toast({ title: 'All bookings have been deleted.' });
      fetchData(); // Refresh data
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error deleting bookings',
        description: error.message,
      });
    }
  };

  const handleDelete = async (id: string, bookingNumber: string) => {
    try {
      await deleteBooking(id);
      toast({ title: `Booking #${bookingNumber} has been deleted.` });
      fetchData();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error deleting booking',
        description: error.message,
      });
    }
  };

  const handleMarkAsComplete = async (id: string, bookingNumber: string) => {
    try {
      await updateBookingStatus(id, 'completed');
      toast({ title: `Booking #${bookingNumber} marked as complete.` });
      fetchData();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error updating status',
        description: error.message,
      });
    }
  };

  const handleSendWhatsApp = (booking: Booking) => {
    const phoneNumber = booking.phone.replace(/\D/g, ''); // Remove non-numeric characters
    const message = `Hi ${booking.name}, this is a message regarding your booking (#${booking.bookingNumber}) for ${booking.service} on ${booking.date}.`;
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const filteredBookings = bookings.filter(booking =>
    booking.bookingNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-muted/40">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="sr-only">Loading bookings...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-muted/40 p-4">
        <Alert variant="destructive" className="max-w-md">
          <ShieldAlert className="h-4 w-4" />
          <AlertTitle>Access Denied</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  const getStatusBadgeVariant = (status: Booking['status']) => {
    switch (status) {
      case 'confirmed':
        return 'default';
      case 'cancelled':
        return 'destructive';
      case 'completed':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  return (
    <>
      <div className="min-h-screen bg-muted/40 p-4 sm:p-10">
        <Card>
          <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
            <div>
              <CardTitle>Client Bookings</CardTitle>
              <CardDescription>
                An overview of all appointments.
              </CardDescription>
            </div>
            <div className="flex items-center gap-2 mt-4 sm:mt-0">
               <Button variant="outline" size="icon" onClick={() => setShowNewBookingsModal(true)} className="relative">
                 <Bell className="h-4 w-4" />
                 {newBookings.length > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                        {newBookings.length}
                    </span>
                 )}
                 <span className="sr-only">View new bookings</span>
               </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownloadPdf}
                disabled={filteredBookings.length === 0}
              >
                <Download className="mr-2 h-4 w-4" />
                Download PDF
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="destructive"
                    size="sm"
                    disabled={bookings.length === 0}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete All
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete
                      all booking records from the database.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeleteAll}>
                      Continue
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardHeader>
          <CardContent>
            <div className="mb-6 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by booking number..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Booking No.</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Service</TableHead>
                    <TableHead>Appt. Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Postcode</TableHead>
                    <TableHead>Notes</TableHead>
                    <TableHead>Booked On</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBookings.length > 0 ? (
                    filteredBookings.map(booking => (
                      <TableRow
                        key={booking.id}
                        className={cn(
                          booking.status === 'cancelled' &&
                            'bg-muted/50 text-muted-foreground'
                        )}
                      >
                        <TableCell className="font-mono text-xs">
                          {booking.bookingNumber}
                        </TableCell>
                        <TableCell className="font-medium">
                          {booking.name}
                        </TableCell>
                        <TableCell>{booking.email}</TableCell>
                        <TableCell>{booking.phone}</TableCell>
                        <TableCell>{booking.service}</TableCell>
                        <TableCell>{booking.date}</TableCell>
                        <TableCell>
                          <Badge variant={getStatusBadgeVariant(booking.status)}>
                            {booking.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{booking.postcode}</TableCell>
                        <TableCell className="max-w-[200px] truncate">
                          {booking.notes || '-'}
                        </TableCell>
                        <TableCell>
                          {new Date(booking.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                               <DropdownMenuItem onClick={() => handleSendWhatsApp(booking)}>
                                <MessageSquare className="mr-2 h-4 w-4" />
                                Send WhatsApp
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() =>
                                  handleMarkAsComplete(
                                    booking.id,
                                    booking.bookingNumber
                                  )
                                }
                                disabled={booking.status === 'completed'}
                              >
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Mark as Complete
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                      <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive focus:bg-destructive/10 focus:text-destructive">
                                          <Trash2 className="mr-2 h-4 w-4" />
                                          Delete
                                      </DropdownMenuItem>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                      <AlertDialogHeader>
                                      <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
                                      <AlertDialogDescription>
                                          Are you sure you want to delete booking #{booking.bookingNumber}? This action cannot be undone.
                                      </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                      <AlertDialogAction
                                          onClick={() => handleDelete(booking.id, booking.bookingNumber)}
                                          className="bg-destructive hover:bg-destructive/90"
                                      >
                                          Delete
                                      </AlertDialogAction>
                                      </AlertDialogFooter>
                                  </AlertDialogContent>
                              </AlertDialog>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={11} className="text-center h-24">
                        No bookings found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
      <Dialog open={showNewBookingsModal} onOpenChange={setShowNewBookingsModal}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>New Bookings</DialogTitle>
              <DialogDescription>
                Here are the bookings you've received since your last login.
              </DialogDescription>
            </DialogHeader>
            <div className="max-h-[60vh] overflow-y-auto p-1">
                {newBookings.length > 0 ? (
                    <ul className="space-y-4">
                        {newBookings.map(b => (
                            <li key={b.id} className="text-sm border-b pb-2">
                                <p><strong>Booking #{b.bookingNumber}</strong></p>
                                <p>{b.name} - {b.service}</p>
                                <p className="text-muted-foreground">{formatDistanceToNow(new Date(b.createdAt), { addSuffix: true })}</p>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-center text-muted-foreground py-8">No new bookings since your last login.</p>
                )}
            </div>
          </DialogContent>
      </Dialog>
    </>
  );
}
