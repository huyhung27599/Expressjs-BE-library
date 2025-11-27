import { Entity, Column } from "typeorm";
import { BaseEntity } from "./BaseEntity";

@Entity("users")
export class User extends BaseEntity {
  @Column({ type: "varchar", length: 255 })
  username!: string;

  @Column({ type: "varchar", length: 255 })
  email!: string;

  @Column({ type: "varchar", length: 255 })
  password!: string;

  @Column({ type: "varchar", length: 255 })
  role!: string;

  @Column({ type: "boolean", default: false })
  isActive!: boolean;
}
