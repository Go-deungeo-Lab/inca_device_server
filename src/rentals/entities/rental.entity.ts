import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Device } from '../../devices/entities/device.entity';

@Entity('rentals')
export class Rental {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'varchar' })
    renterName: string;

    @CreateDateColumn()
    rentedAt: Date;

    @Column({ type: 'datetime', nullable: true })
    returnedAt: Date | null;

    @Column({ default: 'active', type: 'varchar' })
    status: 'active' | 'returned';

    @ManyToOne(() => Device, device => device.rentals)
    @JoinColumn()
    device: Device;

    @Column({ type: 'integer' })
    deviceId: number;
}