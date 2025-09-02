import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject, takeUntil, Observable, forkJoin } from 'rxjs';

import { IAdminUser, UserStatus, IUserRole, IRole, Gender, ProfileVisibility } from '../../interfaces';
import { UserRoles } from '../../enums';
import { TranslatePipe } from '../../../../../shared/pipes/translate.pipe';
import { I18nService } from '../../../../../core/services/i18n.service';
import { UsersService } from '../../../../../core/services/users.service';
import { RolePermissionService } from '../../../../../core/services/role-permission.service';
import { RolesService } from '../../../../../core/services/roles.service';
import { AlertService } from '../../../../../core/services/alert.service';

@Component({
  selector: 'app-user-edit-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslatePipe],
  templateUrl: './user-edit-modal.component.html',
  styleUrls: ['./user-edit-modal.component.scss']
})
export class UserEditModalComponent implements OnInit, OnDestroy, OnChanges {
  private _destroy$ = new Subject<void>();
  private _isModalInitializing = false;
  private _hasBeenInitialized = false;

  @Input() user: IAdminUser | null = null;
  @Input() isVisible = false;
  @Output() close = new EventEmitter<void>();
  @Output() userUpdated = new EventEmitter<IAdminUser>();

  public editForm!: FormGroup;
  public isLoading = false;
  public error: string | null = null;
  public activeTab: 'basic' | 'profile' | 'permissions' = 'basic';
  
  // Enums for template
  public Gender = Gender;
  public ProfileVisibility = ProfileVisibility;
  public UserStatus = UserStatus;
  public UserRoles = UserRoles;
  public availableRoles: UserRoles[] = [];
  public availableRolesList: IRole[] = [];
  public canEditRoles = false;

  constructor(
    private _formBuilder: FormBuilder,
    private _i18nService: I18nService,
    private _usersService: UsersService,
    private _rolePermissionService: RolePermissionService,
    private _rolesService: RolesService,
    private _alertService: AlertService
  ) {}

  ngOnInit(): void {
    this._initForm();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['user'] && changes['user'].currentValue) {
      // Set flag to indicate modal is initializing
      this._isModalInitializing = true;
      
      // Reset to first tab
      this.activeTab = 'basic';
      
      // Cancel any pending operations
      this._destroy$.next();
      this._destroy$ = new Subject<void>();
      
      this._populateForm();
      this._checkPermissions();
      this.error = null;
      
      // Reset flag after initialization
      setTimeout(() => {
        this._isModalInitializing = false;
      }, 100);
    }
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }

  private _initForm(): void {
    this.editForm = this._formBuilder.group({
      // Basic user info
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      firstName: ['', [Validators.required, Validators.minLength(2), this._nameValidator]],
      lastName: ['', [Validators.required, Validators.minLength(2), this._nameValidator]],
      status: ['', [Validators.required]],
      roles: [[]],
      
      // Extended profile fields
      dateOfBirth: [''],
      gender: [''],
      phone: ['', [Validators.pattern(/^\+?[1-9]\d{1,14}$/)]],
      address: ['', [Validators.maxLength(200)]],
      city: ['', [Validators.maxLength(100)]],
      state: ['', [Validators.maxLength(100)]],
      zipCode: ['', [Validators.maxLength(10)]],
      country: ['', [Validators.maxLength(100)]],
      website: ['', [Validators.pattern(/^https?:\/\/.+/)]],
      bio: ['', [Validators.maxLength(500)]],
      avatar: ['', [Validators.pattern(/^https?:\/\/.+/)]],
      profileVisibility: ['PUBLIC']
    });

    // Populate form when user changes
    if (this.user) {
      this._populateForm();
      this._checkPermissions();
    }
  }

  private _populateForm(): void {
    if (!this.user) return;

    const currentRoles = this.user.roles?.map(role => role.name) || [];
    
    this.editForm.patchValue({
      // Basic user info
      username: this.user.username || '',
      email: this.user.email || '',
      firstName: this.user.profile?.firstName || null,
      lastName: this.user.profile?.lastName || null,
      status: this.user.status || '',
      roles: currentRoles,
      
      // Extended profile fields
      dateOfBirth: this.user.profile?.dateOfBirth || null,
      gender: this.user.profile?.gender || null,
      phone: this.user.profile?.phone || null,
      address: this.user.profile?.address || null,
      city: this.user.profile?.city || null,
      state: this.user.profile?.state || null,
      zipCode: this.user.profile?.zipCode || null,
      country: this.user.profile?.country || null,
      website: this.user.profile?.website || null,
      bio: this.user.profile?.bio || null,
      avatar: this.user.profile?.avatar || null,
      profileVisibility: this.user.profile?.profileVisibility || 'PUBLIC'
    });
  }

  private _checkPermissions(): void {
    if (!this.user) return;

    this.canEditRoles = this._rolePermissionService.canChangeUserRoles(this.user);
    this.availableRoles = this._rolePermissionService.getAssignableRoles(this.user);
    
    if (this.canEditRoles) {
      // Only clear cache on first initialization to avoid conflicts
      if (!this._hasBeenInitialized) {
        this._rolesService.clearCache();
        this._hasBeenInitialized = true;
      }
      
      // Load available roles with their UUIDs
      this._rolesService.getAllRoles()
        .pipe(takeUntil(this._destroy$))
        .subscribe({
          next: (roles) => {
            // Filter roles based on what the user can assign (this should already exclude SUPER_ADMIN if needed)
            this.availableRolesList = roles.filter(role => 
              this.availableRoles.some(availableRole => 
                availableRole === role.name
              )
            );
            
            // Double-check: Remove SUPER_ADMIN if it somehow still appears
            const superAdminIndex = this.availableRolesList.findIndex(role => role.name === 'super_admin');
            if (superAdminIndex !== -1) {
              this.availableRolesList.splice(superAdminIndex, 1);
            }
          },
          error: (error) => {
            console.error('❌ Error loading roles:', error);
          }
        });
    }
  }

  public onClose(): void {
    this.editForm.reset();
    this.error = null;
    this.close.emit();
  }

  public onBackdropClick(event: Event): void {
    if (event.target === event.currentTarget) {
      this.onClose();
    }
  }

  public onSubmit(): void {
    if (!this.editForm.valid || !this.user) {
      this._markFormGroupTouched();
      return;
    }

    // Prevent submission during modal initialization
    if (this._isModalInitializing) {
      return;
    }

    this.isLoading = true;
    this.error = null;

    // Create a local copy of the user to avoid null reference issues
    const currentUser = { ...this.user };
    const formValue = this.editForm.value;
    
    // Prepare roles data if user can edit roles
    const currentRoles = currentUser.roles?.map(role => role.name) || [];
    const newRoles = formValue.roles || [];
    const rolesChanged = JSON.stringify(currentRoles.sort()) !== JSON.stringify(newRoles.sort());
    
    // Build update data according to UpdateUserProfileDto structure
    // Send all profile fields at root level as expected by backend
    const updateData: any = {
      // Basic user info - only include if they have valid values
      username: formValue.username?.trim() || currentUser.username,
      email: formValue.email?.trim() || currentUser.email,
    };
    
    // Always include firstName and lastName with valid values or current values
    updateData.firstName = formValue.firstName?.trim() || currentUser.profile?.firstName || '';
    updateData.lastName = formValue.lastName?.trim() || currentUser.profile?.lastName || '';
    
    // Extended profile fields (only include if they have values)
    if (formValue.dateOfBirth && formValue.dateOfBirth.trim()) {
      updateData.dateOfBirth = formValue.dateOfBirth.trim();
    }
    if (formValue.gender && formValue.gender.trim()) {
      updateData.gender = formValue.gender.trim();
    }
    if (formValue.phone && formValue.phone.trim()) {
      updateData.phone = formValue.phone.trim();
    }
    if (formValue.address && formValue.address.trim()) {
      updateData.address = formValue.address.trim();
    }
    if (formValue.city && formValue.city.trim()) {
      updateData.city = formValue.city.trim();
    }
    if (formValue.state && formValue.state.trim()) {
      updateData.state = formValue.state.trim();
    }
    if (formValue.zipCode && formValue.zipCode.trim()) {
      updateData.zipCode = formValue.zipCode.trim();
    }
    if (formValue.country && formValue.country.trim()) {
      updateData.country = formValue.country.trim();
    }
    if (formValue.website && formValue.website.trim()) {
      updateData.website = formValue.website.trim();
    }
    if (formValue.bio && formValue.bio.trim()) {
      updateData.bio = formValue.bio.trim();
    }
    if (formValue.avatar && formValue.avatar.trim()) {
      updateData.avatar = formValue.avatar.trim();
    }
    
    // Profile settings
    updateData.profileVisibility = formValue.profileVisibility || 'PUBLIC';
    updateData.isVerified = currentUser.profile?.isVerified || false;



    // Update user data first (basic info)
    this._usersService.updateUser(currentUser.id, updateData)
      .pipe(takeUntil(this._destroy$))
      .subscribe({
        next: (response) => {
          // Update roles if changed and user has permission
          if (rolesChanged && this.canEditRoles) {
            this._updateUserRoles(currentUser.id, currentRoles, newRoles, formValue, currentUser);
          } else if (formValue.status !== currentUser.status) {
            // Update status if it changed
            this._updateUserStatus(currentUser.id, formValue.status, currentUser);
          } else {
            this.isLoading = false;
            // Create updated admin user object with corrected profile structure
            const updatedAdminUser: IAdminUser = {
              ...currentUser,
              username: formValue.username,
              email: formValue.email,
              profile: {
                ...currentUser.profile,
                firstName: formValue.firstName,
                lastName: formValue.lastName
              }
            };
            
            this.userUpdated.emit(updatedAdminUser);
            const successMessage = this._i18nService.translate('USERS.SUCCESS.UPDATED');
            this._alertService.success(successMessage, 'Usuario Actualizado');
            this.onClose();
          }
        },
        error: (error) => {
          console.error('❌ Error updating user basic data:', error);
          this.isLoading = false;
          
          // Extract specific error messages from backend
          let errorMessage = this._i18nService.translate('USERS.ERRORS.UPDATE_FAILED');
          
          if (error?.error?.message) {
            if (Array.isArray(error.error.message)) {
              // Multiple validation errors
              errorMessage = error.error.message.join('. ');
            } else {
              // Single error message
              errorMessage = error.error.message;
            }
          } else if (error?.message) {
            errorMessage = error.message;
          }
          
          this._alertService.error(errorMessage, 'Error de Actualización');
          this.error = errorMessage;
        }
      });
  }

  private _updateUserStatus(userId: string, newStatus: string, currentUser: IAdminUser): void {
    this._usersService.updateUserStatus(userId, newStatus)
      .pipe(takeUntil(this._destroy$))
      .subscribe({
        next: () => {
          // Get updated form values and roles
          const formValue = this.editForm.value;
          const newRoles = formValue.roles || [];
          
          // Complete the update with status change
          this.isLoading = false;
          
          const updatedRoles: IUserRole[] = newRoles.map((roleName: string) => ({
            id: `${roleName}_id`,
            name: roleName,
            displayName: this._getRoleDisplayName(roleName)
          }));

          const updatedUser: IAdminUser = { 
            ...currentUser, 
            status: newStatus as any,
            profile: {
              ...currentUser.profile,
              firstName: formValue.firstName,
              lastName: formValue.lastName
            },
            username: formValue.username,
            email: formValue.email,
            roles: updatedRoles
          };
          
          this.userUpdated.emit(updatedUser);
          const successMessage = this._i18nService.translate('USERS.SUCCESS.UPDATED');
          this._alertService.success(successMessage, 'Usuario Actualizado');
          this.onClose();
        },
        error: (error) => {
          this.isLoading = false;
          
          // Extract specific error messages from backend
          let errorMessage = this._i18nService.translate('USERS.ERRORS.STATUS_UPDATE_FAILED');
          
          if (error?.error?.message) {
            if (Array.isArray(error.error.message)) {
              errorMessage = error.error.message.join('. ');
            } else {
              errorMessage = error.error.message;
            }
          } else if (error?.message) {
            errorMessage = error.message;
          }
          
          this._alertService.error(errorMessage, 'Error de Estado');
          this.error = errorMessage;
        }
      });
  }

  private _updateUserRoles(userId: string, currentRoles: string[], newRoles: string[], formValue: any, currentUser: IAdminUser): void {
    // Prevent role operations during modal initialization
    if (this._isModalInitializing) {
      return;
    }
    
    // Find roles to add and remove
    const rolesToAdd = newRoles.filter(role => !currentRoles.includes(role));
    const rolesToRemove = currentRoles.filter(role => !newRoles.includes(role));
    
    // Get role UUIDs for operations
    this._rolesService.getAllRoles()
      .pipe(takeUntil(this._destroy$))
      .subscribe({
        next: (allRoles) => {
          // Create observables for all role operations
          const roleOperations: Observable<any>[] = [];
          
          // Add new roles
          rolesToAdd.forEach(roleName => {
            const role = allRoles.find(r => r.name === roleName);
            if (role) {
              roleOperations.push(this._usersService.assignRoleToUser(userId, role.id));
            } else {
              console.warn(`❌ Role not found for assignment: ${roleName}`);
            }
          });
          
          // Remove old roles
          rolesToRemove.forEach(roleName => {
            const role = allRoles.find(r => r.name === roleName);
            if (role) {
              roleOperations.push(this._usersService.removeRoleFromUser(userId, role.id));
            } else {
              console.warn(`❌ Role not found for removal: ${roleName}`);
            }
          });
          
          // Execute all role operations
          if (roleOperations.length > 0) {
            // Use forkJoin to execute all operations in parallel
            forkJoin(roleOperations)
              .pipe(takeUntil(this._destroy$))
              .subscribe({
                next: () => {
                  // After updating roles, check if status also needs updating
                  if (formValue.status !== currentUser.status) {
                    this._updateUserStatus(userId, formValue.status, currentUser);
                  } else {
                    this._completeUpdate(formValue, newRoles, currentUser);
                  }
                },
                error: (error) => {
                  this.isLoading = false;
                  
                  // Extract specific error messages from backend
                  let errorMessage = this._i18nService.translate('USERS.ERRORS.ROLE_UPDATE_FAILED');
                  
                  if (error?.error?.message) {
                    if (Array.isArray(error.error.message)) {
                      errorMessage = error.error.message.join('. ');
                    } else {
                      errorMessage = error.error.message;
                    }
                  } else if (error?.message) {
                    errorMessage = error.message;
                  }
                  
                  this.error = errorMessage;
                  this._alertService.error(errorMessage, 'Error de Roles');
                  console.error('Error updating roles:', error);
                }
              });
          } else {
            // No role changes, proceed with status update if needed
            if (formValue.status !== currentUser.status) {
              this._updateUserStatus(userId, formValue.status, currentUser);
            } else {
              this._completeUpdate(formValue, newRoles, currentUser);
            }
          }
        },
        error: (error) => {
          this.isLoading = false;
          
          // Extract specific error messages from backend
          let errorMessage = this._i18nService.translate('USERS.ERRORS.ROLE_UPDATE_FAILED');
          
          if (error?.error?.message) {
            if (Array.isArray(error.error.message)) {
              errorMessage = error.error.message.join('. ');
            } else {
              errorMessage = error.error.message;
            }
          } else if (error?.message) {
            errorMessage = error.message;
          }
          
          this.error = errorMessage;
          this._alertService.error(errorMessage, 'Error de Roles');
          console.error('Error loading roles for update:', error);
        }
      });
  }

  private _completeUpdate(formValue: any, newRoles: string[], currentUser: IAdminUser): void {
    this.isLoading = false;
    
    // Create updated admin user object with new roles
    const updatedRoles: IUserRole[] = newRoles.map(roleName => ({
      id: `${roleName}_id`,
      name: roleName,
      displayName: this._getRoleDisplayName(roleName)
    }));
    
    const updatedUser: IAdminUser = {
      ...currentUser,
      username: formValue.username,
      email: formValue.email,
      profile: {
        ...currentUser.profile,
        firstName: formValue.firstName,
        lastName: formValue.lastName
      },
      roles: updatedRoles
    };
    
    this.userUpdated.emit(updatedUser);
    const successMessage = this._i18nService.translate('USERS.SUCCESS.UPDATED');
    this._alertService.success(successMessage, 'Usuario Actualizado');
    this.onClose();
  }

  private _markFormGroupTouched(): void {
    Object.keys(this.editForm.controls).forEach(key => {
      const control = this.editForm.get(key);
      if (control) {
        control.markAsTouched();
      }
    });
  }

  public isFieldInvalid(fieldName: string): boolean {
    const field = this.editForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  public getFieldError(fieldName: string): string {
    const field = this.editForm.get(fieldName);
    if (!field || !field.errors || !field.touched) return '';

    const errors = field.errors;
    
    if (errors['required']) {
      return this._i18nService.translate('VALIDATION.REQUIRED');
    }
    
    if (errors['email']) {
      return this._i18nService.translate('VALIDATION.EMAIL_INVALID');
    }
    
    if (errors['minlength']) {
      const requiredLength = errors['minlength'].requiredLength;
      return this._i18nService.translate('VALIDATION.MIN_LENGTH', { min: requiredLength });
    }
    
    if (errors['hasNumbers']) {
      return 'El nombre no puede contener números';
    }
    
    if (errors['invalidCharacters']) {
      return 'El nombre solo puede contener letras, espacios, guiones y apóstrofes';
    }
    
    return this._i18nService.translate('VALIDATION.INVALID');
  }

  public getDisplayName(): string {
    if (!this.user) return '';
    
    const firstName = this.user.profile?.firstName;
    const lastName = this.user.profile?.lastName;
    
    if (firstName && lastName) {
      return `${firstName} ${lastName}`;
    } else if (firstName) {
      return firstName;
    } else if (lastName) {
      return lastName;
    } else if (this.user.username) {
      return this.user.username;
    } else {
      return this._i18nService.translate('USERS.FALLBACKS.NO_NAME');
    }
  }

  public getInitials(): string {
    if (!this.user) return '?';
    
    const firstName = this.user.profile?.firstName;
    const lastName = this.user.profile?.lastName;
    
    const firstInitial = firstName && firstName.length > 0 ? firstName.charAt(0) : '';
    const lastInitial = lastName && lastName.length > 0 ? lastName.charAt(0) : '';
    
    if (!firstInitial && !lastInitial) {
      return '?';
    }
    
    return `${firstInitial}${lastInitial}`.toUpperCase();
  }

  private _getRoleDisplayName(roleName: string): string {
    const roleDisplayNames: { [key: string]: string } = {
      'super_admin': this._i18nService.translate('USERS.ROLES.SUPER_ADMIN'),
      'admin': this._i18nService.translate('USERS.ROLES.ADMIN'),
      'store_admin': this._i18nService.translate('USERS.ROLES.STORE_ADMIN'),
      'store_manager': this._i18nService.translate('USERS.ROLES.STORE_MANAGER'),
      'store_employee': this._i18nService.translate('USERS.ROLES.STORE_EMPLOYEE'),
      'customer': this._i18nService.translate('USERS.ROLES.CUSTOMER'),
      'guest': this._i18nService.translate('USERS.ROLES.GUEST')
    };
    
    return roleDisplayNames[roleName.toLowerCase()] || roleName;
  }

  public getRoleDisplayName(roleName: string): string {
    return this._getRoleDisplayName(roleName);
  }

  public onRoleChange(role: string, isChecked: boolean): void {
    const currentRoles = this.editForm.get('roles')?.value || [];
    
    if (isChecked) {
      if (!currentRoles.includes(role)) {
        const newRoles = [...currentRoles, role];
        this.editForm.patchValue({ roles: newRoles });
      }
    } else {
      const newRoles = currentRoles.filter((r: string) => r !== role);
      this.editForm.patchValue({ roles: newRoles });
    }
  }

  public isRoleSelected(role: string): boolean {
    const currentRoles = this.editForm.get('roles')?.value || [];
    return currentRoles.includes(role);
  }

  /**
   * Custom validator for names - only letters, spaces, hyphens, and apostrophes
   */
  private _nameValidator(control: any) {
    if (!control.value) return null;
    
    const namePattern = /^[a-zA-ZÀ-ÿ\s\-']+$/;
    const hasNumbers = /\d/.test(control.value);
    
    if (hasNumbers) {
      return { hasNumbers: true };
    }
    
    if (!namePattern.test(control.value)) {
      return { invalidCharacters: true };
    }
    
    return null;
  }

}
