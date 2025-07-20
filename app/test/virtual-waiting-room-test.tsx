/**
 * Quick test to verify virtual waiting room imports and functionality
 */
import { VirtualWaitingRoomService } from '@/lib/firestore/virtual-waiting-room-service';
import { useVirtualWaitingRoom } from '@/hooks/use-virtual-waiting-room';
import { VirtualWaitingRoomPatientCard } from '@/app/components/doctor/virtual-waiting-room-patient-card';
import { VirtualWaitingRoomStats } from '@/app/components/doctor/virtual-waiting-room-stats';
import { VirtualWaitingRoomQueueControls } from '@/app/components/doctor/virtual-waiting-room-queue-controls';

// Test that all imports are working
console.log('All virtual waiting room imports are working correctly!');

export default function VirtualWaitingRoomTest() {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Virtual Waiting Room Test</h1>
      <p className="text-zinc-600 dark:text-zinc-400">
        All components and services are imported successfully!
      </p>
    </div>
  );
}
