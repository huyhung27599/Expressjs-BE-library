import { Entity, Column } from "typeorm";
import { BaseEntity } from "./BaseEntity";
import { UserRole, UserStatus } from "../enums";

@Entity("users")
export class User extends BaseEntity {
  @Column({ type: "varchar", length: 255, unique: true })
  username!: string;

  @Column({ type: "varchar", length: 255, unique: true })
  email!: string;

  @Column({ type: "varchar", length: 255, select: false })
  password!: string;

  @Column({
    type: "enum",
    enum: UserRole,
    default: UserRole.USER,
  })
  role!: UserRole;

  @Column({ type: "varchar", length: 255, nullable: true })
  fullName?: string;

  @Column({ type: "varchar", length: 20, nullable: true })
  phoneNumber?: string;

  @Column({
    type: "enum",
    enum: UserStatus,
    default: UserStatus.PENDING,
  })
  status?: UserStatus;

  @Column({ type: "boolean", default: false })
  isActive?: boolean;
}
