// src/system/entities/system-config.entity.ts
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('system_config')
export class SystemConfig {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: false })
  isTestMode: boolean;

  @Column({ type: 'varchar', nullable: true })
  testMessage: string | null; // 관리자가 설정한 테스트 메시지

  @Column({ type: 'timestamp', nullable: true })
  testStartDate: Date | null; // 테스트 시작일

  @Column({ type: 'timestamp', nullable: true })
  testEndDate: Date | null; // 테스트 종료일

  @Column({ type: 'varchar', nullable: true })
  testType: string | null; // 테스트 유형 (예: "호환성 테스트", "인수 테스트")

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
