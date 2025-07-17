import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Rental } from '../../rentals/entities/rental.entity';

@Entity('devices')
export class Device {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, type: 'varchar' })
  deviceNumber: string; // No. (예: "8", "I-2")

  @Column({ type: 'varchar' })
  productName: string; // 제품명 (예: "Galaxy Note 9", "iPhone XR")

  @Column({ type: 'varchar', nullable: true })
  modelName: string; // 모델명 (예: "SM-N960N", "A2105") - iOS는 모델번호

  @Column({ type: 'varchar' })
  osVersion: string; // OS 버전 (예: "10.0", "14.6.0")

  @Column({ default: false })
  isRootedOrJailbroken: boolean; // 루팅/탈옥 여부

  @Column({ type: 'varchar', default: 'Android' })
  platform: 'Android' | 'iOS'; // 플랫폼

  @Column({ default: 'available', type: 'varchar' })
  status: 'available' | 'rented';

  @Column({ nullable: true, type: 'varchar' })
  currentRenter: string | null;

  @OneToMany(() => Rental, (rental) => rental.device)
  rentals: Rental[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
