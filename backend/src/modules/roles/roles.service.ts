import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from './roles.entity';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
  ) {}

  /**
   * Helper method to safely extract error message
   */
  private getErrorMessage(error: unknown): string {
    return error instanceof Error ? error.message : 'Unknown error occurred';
  }

  /**
   * Helper method to safely check error code
   */
  private getErrorCode(error: unknown): string | null {
    if (error && typeof error === 'object' && 'code' in error) {
      const errorWithCode = error as { code: unknown };
      return typeof errorWithCode.code === 'string' ? errorWithCode.code : String(errorWithCode.code);
    }
    return null;
  }

  /**
   * Get role by name
   * @param name - Role name to search for
   * @returns Promise<Role | null>
   */
  async getByName(name: string): Promise<Role | null> {
    try {
      const role = await this.roleRepository.findOne({
        where: { name: name.toLowerCase() }
      });
      return role;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Error finding role by name: ${message}`);
    }
  }

  /**
   * Create default roles (admin, seller, customer)
   * @returns Promise<Role[]>
   */
  async createDefaultRoles(): Promise<Role[]> {
    const defaultRoles = ['admin', 'seller', 'customer'];
    const createdRoles: Role[] = [];

    for (const roleName of defaultRoles) {
      try {
        // Check if role already exists
        const existingRole = await this.getByName(roleName);
        
        if (!existingRole) {
          const newRole = this.roleRepository.create({
            name: roleName.toLowerCase()
          });
          
          const savedRole = await this.roleRepository.save(newRole);
          createdRoles.push(savedRole);
        } else {
          // Role already exists, add to the list
          createdRoles.push(existingRole);
        }
      } catch (error) {
        const errorCode = this.getErrorCode(error);
        if (errorCode === '23505') { // PostgreSQL unique constraint violation
          // Role already exists, fetch it
          const existingRole = await this.getByName(roleName);
          if (existingRole) {
            createdRoles.push(existingRole);
          }
        } else {
          const message = this.getErrorMessage(error);
          throw new ConflictException(`Error creating role ${roleName}: ${message}`);
        }
      }
    }

    return createdRoles;
  }

  /**
   * List all roles
   * @returns Promise<Role[]>
   */
  async listRoles(): Promise<Role[]> {
    try {
      const roles = await this.roleRepository.find({
        order: { name: 'ASC' }
      });
      return roles;
    } catch (error) {
      throw new Error(`Error listing roles: ${this.getErrorMessage(error)}`);
    }
  }

  /**
   * Create a new role
   * @param name - Role name
   * @returns Promise<Role>
   */
  async createRole(name: string): Promise<Role> {
    try {
      // Check if role already exists
      const existingRole = await this.getByName(name);
      if (existingRole) {
        throw new ConflictException(`Role with name '${name}' already exists`);
      }

      const newRole = this.roleRepository.create({
        name: name.toLowerCase()
      });

      return await this.roleRepository.save(newRole);
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new Error(`Error creating role: ${this.getErrorMessage(error)}`);
    }
  }

  /**
   * Get role by ID
   * @param id - Role ID
   * @returns Promise<Role>
   */
  async getRoleById(id: number): Promise<Role> {
    try {
      const role = await this.roleRepository.findOne({
        where: { id }
      });

      if (!role) {
        throw new NotFoundException(`Role with ID ${id} not found`);
      }

      return role;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error(`Error finding role by ID: ${this.getErrorMessage(error)}`);
    }
  }

  /**
   * Delete role by ID
   * @param id - Role ID
   * @returns Promise<void>
   */
  async deleteRole(id: number): Promise<void> {
    try {
      const role = await this.getRoleById(id);
      await this.roleRepository.remove(role);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error(`Error deleting role: ${this.getErrorMessage(error)}`);
    }
  }
}
